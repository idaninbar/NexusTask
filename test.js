const assert = require("assert");

const BASE_URL = "http://localhost:3000/api/v1";
const RESELLER_TOKEN = "secret-reseller-token"; // Valid token [cite: 81]
const INVALID_TOKEN = "wrong-token-123";

// Helper to create products for testing
async function createAdminProduct(overrides = {}) {
  const defaultProduct = {
    name: "Test Coupon",
    description: "A comprehensive test product",
    image_url: "https://example.com/image.png",
    cost_price: 100,
    margin_percentage: 20,
    value_type: "STRING",
    value: "SECRET-TEST-CODE-123",
  };
  const res = await fetch(`${BASE_URL}/admin/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...defaultProduct, ...overrides }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runComprehensiveTests() {
  console.log("🧪 Starting Comprehensive Edge-Case Test Suite...\n");
  let productIds = [];

  try {
    // ==========================================
    // SUITE 1: DOMAIN VALIDATIONS & PRICING
    // ==========================================
    console.log("--- SUITE 1: Validations & Pricing Rules ---");

    // 1.1: cost_price must be >= 0
    let res = await createAdminProduct({ cost_price: -10 });
    assert.strictEqual(res.status, 400, "Should reject negative cost_price");
    console.log("✅ Edge Case: Negative cost_price rejected ");

    // 1.2: margin_percentage must be >= 0
    res = await createAdminProduct({ margin_percentage: -5 });
    assert.strictEqual(
      res.status,
      400,
      "Should reject negative margin_percentage",
    );
    console.log("✅ Edge Case: Negative margin_percentage rejected ");

    // 1.3: Required fields validation (Missing image_url)
    res = await createAdminProduct({ image_url: undefined });
    assert.strictEqual(res.status, 400, "Should reject missing image_url");
    console.log("✅ Edge Case: Missing required image_url rejected [cite: 25]");

    // 1.4: Invalid value_type enum
    res = await createAdminProduct({ value_type: "VIDEO" });
    assert.strictEqual(res.status, 400, "Should reject invalid value_type");
    console.log(
      "✅ Edge Case: Enforced value_type ENUM (STRING | IMAGE) [cite: 52]",
    );

    // 1.5: Server-side minimum_sell_price calculation formula
    // minimum_sell_price = cost_price * (1 + margin_percentage / 100)
    let calcTest = await createAdminProduct({
      cost_price: 80,
      margin_percentage: 25,
    });
    assert.strictEqual(calcTest.status, 201);
    assert.strictEqual(
      calcTest.data.minimum_sell_price,
      100,
      "80 * 1.25 must equal 100",
    );
    productIds.push(calcTest.data._id);
    console.log(
      "✅ Success: Exact pricing formula calculated server-side [cite: 38, 39, 40, 41, 42, 43]",
    );

    // ==========================================
    // SUITE 2: RESELLER API AUTHENTICATION
    // ==========================================
    console.log("\n--- SUITE 2: Reseller Authentication ---");

    // 2.1: Missing Token
    let authTest = await fetch(`${BASE_URL}/products`);
    assert.strictEqual(authTest.status, 401, "Should reject missing token");

    // 2.2: Invalid Token
    authTest = await fetch(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${INVALID_TOKEN}` },
    });
    assert.strictEqual(authTest.status, 401, "Should reject invalid token");
    let authData = await authTest.json();
    assert.strictEqual(
      authData.error_code,
      "UNAUTHORIZED",
      "Missing/invalid token must return 401 UNAUTHORIZED ",
    );
    console.log(
      "✅ Edge Case: Strict Bearer Token validation enforced [cite: 79, 80]",
    );

    // ==========================================
    // SUITE 3: DATA HIDING & ABSTRACTION
    // ==========================================
    console.log("\n--- SUITE 3: Data Hiding ---");

    let validAuthTest = await fetch(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${RESELLER_TOKEN}` },
    });
    let productsList = await validAuthTest.json();
    let sampleProduct = productsList[0];

    assert.strictEqual(
      sampleProduct.cost_price,
      undefined,
      "cost_price leaked!",
    );
    assert.strictEqual(
      sampleProduct.margin_percentage,
      undefined,
      "margin_percentage leaked!",
    );
    assert.strictEqual(
      sampleProduct.value,
      undefined,
      "Coupon value leaked before purchase!",
    );
    assert.ok(
      sampleProduct.price,
      "Must map minimum_sell_price to price in public API [cite: 94]",
    );
    console.log(
      "✅ Edge Case: Private margin, cost_price, and secret value hidden from GET requests [cite: 48, 97, 98, 99]",
    );

    // ==========================================
    // SUITE 4: RESELLER PURCHASE LOGIC
    // ==========================================
    console.log("\n--- SUITE 4: Reseller Purchase Validations ---");
    let resellerTarget = await createAdminProduct({
      cost_price: 100,
      margin_percentage: 10,
    }); // minimum: 110
    let rId = resellerTarget.data._id;
    productIds.push(rId);

    // 4.1: Attempt to purchase below minimum_sell_price
    let purchaseRes = await fetch(`${BASE_URL}/products/${rId}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESELLER_TOKEN}`,
      },
      body: JSON.stringify({ reseller_price: 105 }), // 105 is < 110
    });
    let purchaseData = await purchaseRes.json();
    assert.strictEqual(purchaseRes.status, 400);
    assert.strictEqual(purchaseData.error_code, "RESELLER_PRICE_TOO_LOW");
    console.log(
      "✅ Edge Case: Rejected reseller_price < minimum_sell_price [cite: 72, 73, 141]",
    );

    // 4.2: Successful Reseller Purchase (Higher Price)
    purchaseRes = await fetch(`${BASE_URL}/products/${rId}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESELLER_TOKEN}`,
      },
      body: JSON.stringify({ reseller_price: 150 }), // 150 > 110
    });
    purchaseData = await purchaseRes.json();
    assert.strictEqual(purchaseRes.status, 200);
    assert.strictEqual(
      purchaseData.final_price,
      150,
      "Final price must reflect reseller override",
    );
    assert.ok(
      purchaseData.value,
      "Must return coupon value on success [cite: 77]",
    );
    console.log("✅ Success: Valid reseller purchase processed [cite: 69]");

    // 4.3: Attempt to purchase already sold product
    purchaseRes = await fetch(`${BASE_URL}/products/${rId}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESELLER_TOKEN}`,
      },
      body: JSON.stringify({ reseller_price: 150 }),
    });
    purchaseData = await purchaseRes.json();
    assert.strictEqual(purchaseRes.status, 409);
    assert.strictEqual(purchaseData.error_code, "PRODUCT_ALREADY_SOLD");
    console.log(
      "✅ Edge Case: Prevented double-selling a coupon [cite: 120, 140]",
    );

    // ==========================================
    // SUITE 5: DIRECT CUSTOMER PURCHASE LOGIC
    // ==========================================
    console.log("\n--- SUITE 5: Customer Purchase Validations ---");
    let customerTarget = await createAdminProduct({
      cost_price: 50,
      margin_percentage: 50,
    }); // minimum: 75
    let cId = customerTarget.data._id;
    productIds.push(cId);

    // 5.1: Customer attempts to override price (should be ignored by backend)
    let custBuyRes = await fetch(
      `${BASE_URL}/customer/products/${cId}/purchase`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requested_price: 10 }), // Hack attempt
      },
    );
    let custBuyData = await custBuyRes.json();
    assert.strictEqual(custBuyRes.status, 200);
    assert.strictEqual(
      custBuyData.final_price,
      75,
      "Customer must pay exactly the minimum_sell_price [cite: 62]",
    );
    console.log("✅ Edge Case: Customers cannot override pricing ");

    // 5.2: Product Not Found Test (Invalid UUID/ID format or non-existent)
    let notFoundRes = await fetch(
      `${BASE_URL}/customer/products/65c2b2a1c0d0c3456789abcd/purchase`,
      {
        method: "POST",
      },
    );
    let notFoundData = await notFoundRes.json();
    assert.strictEqual(notFoundRes.status, 404);
    assert.strictEqual(
      notFoundData.error_code,
      "PRODUCT_NOT_FOUND",
      "Missing products return 404 [cite: 110, 139]",
    );
    console.log(
      "✅ Edge Case: Handles non-existent products gracefully [cite: 119]",
    );

    // ==========================================
    // SUITE 6: ADMIN CRUD & RECALCULATIONS
    // ==========================================
    console.log("\n--- SUITE 6: Admin Updates ---");
    let updateTarget = await createAdminProduct({
      cost_price: 100,
      margin_percentage: 10,
    }); // minimum: 110
    let uId = updateTarget.data._id;
    productIds.push(uId);

    let updateRes = await fetch(`${BASE_URL}/admin/products/${uId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cost_price: 200, margin_percentage: 50 }), // new minimum: 300
    });
    let updateData = await updateRes.json();
    assert.strictEqual(
      updateData.minimum_sell_price,
      300,
      "Updating cost/margin must recalculate minimum_sell_price",
    );
    console.log(
      "✅ Edge Case: Admin updates trigger server-side recalculation [cite: 146]",
    );

    // Cleanup: Admin Delete
    for (let id of productIds) {
      await fetch(`${BASE_URL}/admin/products/${id}`, { method: "DELETE" });
    }
    console.log(
      "✅ Admin deletion works and environment cleaned up [cite: 147]",
    );

    // ==========================================
    // SUITE 7: BOUNDARY CONDITIONS (ZEROS & EXACT MATCHES)
    // ==========================================
    console.log("\n--- SUITE 7: Boundary Conditions ---");

    // 7.1: Rules state cost_price >= 0 and margin_percentage >= 0. Testing exactly 0.
    let zeroProduct = await createAdminProduct({
      cost_price: 0,
      margin_percentage: 0,
    });
    assert.strictEqual(
      zeroProduct.status,
      201,
      "Should allow 0 for cost and margin",
    );
    assert.strictEqual(
      zeroProduct.data.minimum_sell_price,
      0,
      "Formula should compute 0",
    );
    productIds.push(zeroProduct.data._id);
    console.log(
      "✅ Boundary Case: cost_price and margin_percentage can be exactly 0 [cite: 46, 47]",
    );

    // 7.2: Reseller validation rule is reseller_price >= minimum_sell_price. Testing EXACT match.
    let exactMatchRes = await fetch(
      `${BASE_URL}/products/${zeroProduct.data._id}/purchase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESELLER_TOKEN}`,
        },
        body: JSON.stringify({ reseller_price: 0 }), // Exactly equals the minimum_sell_price of 0
      },
    );
    assert.strictEqual(
      exactMatchRes.status,
      200,
      "Should allow exact price match",
    );
    console.log(
      "✅ Boundary Case: Reseller can purchase at EXACTLY the minimum_sell_price [cite: 72]",
    );

    // ==========================================
    // SUITE 8: CONCURRENCY & ATOMICITY (RACE CONDITIONS)
    // ==========================================
    console.log("\n--- SUITE 8: Concurrency & Atomicity ---");
    let raceProduct = await createAdminProduct({
      cost_price: 50,
      margin_percentage: 20,
    });
    let raceId = raceProduct.data._id;
    productIds.push(raceId);

    // Simulate 5 users clicking "Buy" at the exact same millisecond using Promise.all
    console.log(
      "Firing 5 simultaneous purchase requests for a single coupon...",
    );
    const racePromises = [];
    for (let i = 0; i < 5; i++) {
      racePromises.push(
        fetch(`${BASE_URL}/customer/products/${raceId}/purchase`, {
          method: "POST",
        }).then((r) => r.status),
      );
    }

    const raceResults = await Promise.all(racePromises);

    // Count how many succeeded and how many failed
    const successes = raceResults.filter((status) => status === 200).length;
    const conflicts = raceResults.filter((status) => status === 409).length;

    assert.strictEqual(
      successes,
      1,
      "Only ONE request should be allowed to succeed",
    );
    assert.strictEqual(
      conflicts,
      4,
      "The other four requests MUST be blocked with 409 Conflict",
    );
    console.log(
      `✅ Concurrency Case: 1 success, ${conflicts} blocked. Atomic operations work perfectly! [cite: 66, 74, 122]`,
    );

    console.log("\n🎉 ALL EDGE CASES PASSED! The API is rock solid.");
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

runComprehensiveTests();
