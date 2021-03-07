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

  it("approves tokens for delegated transfer", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then((success) => {
        assert.strictEqual(success, true, "transaction aproving");
        return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
      })
      .then((receipt) => {
        assert.strictEqual(receipt.logs.length, 1, "triggers one event");
        assert.strictEqual(
          receipt.logs[0].event,
          "Approval",
          'should be the "Approval" event'
        );
        assert.strictEqual(
          receipt.logs[0].args._owner,
          accounts[0],
          "logs the account the tokens are authorized by"
        );
        assert.strictEqual(
          receipt.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are authorized to"
        );
        assert.strictEqual(
          receipt.logs[0].args._amount.toNumber(),
          100,
          "logs the transfer amount"
        );
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.strictEqual(
          allowance.toNumber(),
          100,
          "stores the allowance for delegated trasnfer"
        );
      });
  });

  it("handles delegated token transfers", function () {
    return MyToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // Transfer some tokens to fromAccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then(function (receipt) {
        // Approve spendingAccount to spend 10 tokens form fromAccount
        return tokenInstance.approve(spendingAccount, 9, {
          from: fromAccount,
        });
      })
      .then(function (receipt) {
        // Try transferring something larger than the sender's balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than balance"
        );
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
          from: spendingAccount,
        });
      })
      .then(assert.fail)
      .catch((err) => {
        assert(
          err.message.includes("revert"),
          "cannot transfer value larger than approved amount"
        );
        return tokenInstance.transferFrom
          .call(fromAccount, toAccount, 9, { from: spendingAccount })
          .then((success) => {
            assert(success, "transfer vaild mount success");
            return tokenInstance.transferFrom(fromAccount, toAccount, 9, {
              from: spendingAccount,
            });
          })
          .then((receipt) => {
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(
              receipt.logs[0].event,
              "Transfer",
              'should be the "Transfer" event'
            );
            assert.equal(
              receipt.logs[0].args._from,
              fromAccount,
              "logs the account the tokens are transferred from"
            );
            assert.equal(
              receipt.logs[0].args._to,
              toAccount,
              "logs the account the tokens are transferred to"
            );
            assert.equal(
              receipt.logs[0].args._value.toNumber(),
              9,
              "logs the transfer amount"
            );
            return tokenInstance.balanceOf(fromAccount);
          })
          .then((balance) => {
            assert.strictEqual(
              balance.toNumber(),
              91,
              "deducts the amount from the sending account"
            );
            return tokenInstance.balanceOf(toAccount);
          })
          .then((balance) => {
            assert.strictEqual(
              balance.toNumber(),
              9,
              "add the amount to the reciving account"
            );
            return tokenInstance.allowance(fromAccount, spendingAccount);
          })
          .then((allowance) => {
            assert.strictEqual(
              allowance.toNumber(),
              0,
              "deducts the amount from the allawance"
            );
          });
      });
  });
});
