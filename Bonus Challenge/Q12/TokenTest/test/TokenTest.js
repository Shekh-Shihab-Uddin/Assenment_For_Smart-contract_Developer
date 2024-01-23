const ExpirableERC20Token = artifacts.require("ExpirableERC20Token");
const TokenFactory = artifacts.require("TokenFactory");

contract("TokenTest", (accounts) => {
  let tokenInstance;
  let factoryInstance;

  before(async () => {
    factoryInstance = await TokenFactory.new({ from: accounts[0] });
  });

  it("should create a new ERC-20 token, assign a batch ID, transfer tokens, and handle token expiry", async () => {
    // Create a new ERC-20 token with a batch ID
    const initialSupply = 100;
    const expiryDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const batchId = 1;

    await factoryInstance.createToken("TestToken", "TT", initialSupply, expiryDate, batchId, initialSupply);

    // Retrieve the deployed token address
    const tokenAddress = await factoryInstance.getTokenAddress(batchId);
    tokenInstance = await ExpirableERC20Token.at(tokenAddress);

    // Check the initial balances
    const ownerBalance = await tokenInstance.balanceOf(accounts[0]);
    const recipientBalance = await tokenInstance.balanceOf(accounts[1]);
    assert.equal(ownerBalance.toNumber(), initialSupply, "Owner should have initial supply");
    assert.equal(recipientBalance.toNumber(), 0, "Recipient should have zero balance");

    // Transfer tokens using batch ID
    const transferAmount = 50;
    await tokenInstance.transferByBatch(accounts[1], transferAmount, batchId);

    // Check balances after transfer
    const newOwnerBalance = await tokenInstance.balanceOf(accounts[0]);
    const newRecipientBalance = await tokenInstance.balanceOf(accounts[1]);
    assert.equal(newOwnerBalance.toNumber(), initialSupply - transferAmount, "Owner balance should decrease");
    assert.equal(newRecipientBalance.toNumber(), transferAmount, "Recipient balance should increase");

    // Wait for the token to expire
    await new Promise((resolve) => setTimeout(resolve, 3600000)); // 1 hour

    // Attempt transfer after token expiry
    try {
      await tokenInstance.transferByBatch(accounts[0], 10, batchId);
      assert.fail("Transfer should fail after token expiry");
    } catch (error) {
      assert.include(error.message, "Token has expired", "Transfer should fail after token expiry");
    }
  });
});
