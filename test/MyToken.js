const MyToken = artifacts.require("./MyToken.sol");

contract("MyToken", (accounts) => {
  it("sets the total supply", () => {
    return MyToken.deployed()
      .then((instace) => {
        tokenInstance = instace;
        return (totalSupply = tokenInstance.totalSupply());
      })
      .then((totalSupply) => {
        assert.strictEqual(
          totalSupply.toNumber(),
          1000000,
          "total supply equal to 1000000"
        );
      });
  });
});
