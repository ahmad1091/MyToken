const MyToken = artifacts.require("./MyToken.sol");

contract("MyToken", (accounts) => {
  it("initialize token name and symbol", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.strictEqual(name, "MyToken", "has the correct name");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.strictEqual(symbol, "MYN", "check the symbol");
        return tokenInstance.standard();
      })
      .then((standard) => {
        assert.strictEqual(standard, "ERC20", "check the standard");
      });
  });

  it("sets the total supply", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return (totalSupply = tokenInstance.totalSupply());
      })
      .then((totalSupply) => {
        assert.strictEqual(
          totalSupply.toNumber(),
          1000000,
          "total supply equal to 1,000,000"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((adminBalance) => {
        assert.strictEqual(
          adminBalance.toNumber(),
          1000000,
          "initial admin balance equale to the total supply  1,000,000"
        );
      });
  });
});
