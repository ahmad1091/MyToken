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

  it("transfer token ownership", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.transfer.call(accounts[1], 10000000000);
      })
      .then(assert.fail)
      .catch((err) => {
        assert(err.message.includes("revert"), "message must includes revert");
        return tokenInstance.transfer
          .call(accounts[1], 500000, {
            from: accounts[0],
          })
          .then((success) => {
            assert.strictEqual(success, true);
            return tokenInstance.transfer(accounts[1], 500000, {
              from: accounts[0],
            });
          })
          .then((receipt) => {
            assert.strictEqual(receipt.logs.length, 1, "triggers one event");
            assert.strictEqual(
              receipt.logs[0].event,
              "Transfer",
              'should be the "Transfer" event'
            );
            assert.strictEqual(
              receipt.logs[0].args._from,
              accounts[0],
              "logs the account the tokens are transferred from"
            );
            assert.strictEqual(
              receipt.logs[0].args._to,
              accounts[1],
              "logs the account the tokens are transferred to"
            );
            assert.strictEqual(
              receipt.logs[0].args._value.toNumber(),
              500000,
              "logs the transfer amount"
            );
            return tokenInstance.balanceOf(accounts[1]);
          })
          .then((balance) => {
            assert.strictEqual(
              balance.toNumber(),
              500000,
              "adds the amount for the reciver account"
            );
            return tokenInstance.balanceOf(accounts[0]);
          })
          .then((balance) => {
            assert.strictEqual(
              balance.toNumber(),
              500000,
              "proper amount substracted from master account"
            );
          });
      });
  });
});
