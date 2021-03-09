const MyTokenSale = artifacts.require("./MyTokenSale.sol");
const MyToken = artifacts.require("./MyToken.sol");

contract("MyTokenSale", (accounts) => {
  var tokenSaleInstance;
  var tokenInstance;
  var admin = accounts[0];
  var tokenPrice = 1000000000000000;
  var tokensAvailable = 750000;
  var buyer = accounts[1];
  var numberOfTokens;
  it("initilize the conyract with proper values", () => {
    return MyTokenSale.deployed()
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then((address) => {
        assert(address > 0, "has contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then((address) => {
        assert(address > 0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.strictEqual(
          price.toNumber(),
          tokenPrice,
          "token price is corret"
        );
      });
  });

  it("facilitates token buy", () => {
    return MyToken.deployed().then((instance) => {
      const numberOfTokens = 10;
      const value = numberOfTokens * tokenPrice;
      tokenInstance = instance;
      return MyTokenSale.deployed()
        .then((instance) => {
          tokenSaleInstance = instance;

          return tokenInstance.transfer(
            tokenSaleInstance.address,
            tokensAvailable,
            { from: admin }
          );
        })
        .then((receipt) => {
          return tokenSaleInstance.buyTokens(numberOfTokens, {
            from: buyer,
            value: value,
          });
        })
        .then((receipt) => {
          assert.strictEqual(receipt.logs.length, 1, "triggers one event");
          assert.strictEqual(
            receipt.logs[0].event,
            "Sell",
            'should be the "Sell" event'
          );
          assert.strictEqual(
            receipt.logs[0].args._buyer,
            buyer,
            "logs the account that purchased the tokens"
          );
          assert.strictEqual(
            receipt.logs[0].args._amount.toNumber(),
            numberOfTokens,
            "logs the number of tokens purchased"
          );
          return tokenSaleInstance.tokenSold();
        })
        .then((amount) => {
          assert.strictEqual(
            amount.toNumber(),
            numberOfTokens,
            "increment the number of tokens sold"
          );
          return tokenInstance.balanceOf(buyer);
        })
        .then((balance) => {
          assert.strictEqual(
            balance.toNumber(),
            numberOfTokens,
            "balance ....."
          );
          return tokenInstance.balanceOf(tokenSaleInstance.address);
        })
        .then((balance) => {
          assert.strictEqual(
            balance.toNumber(),
            tokensAvailable - numberOfTokens,
            "balance .l.l"
          );
          return tokenSaleInstance
            .buyTokens(numberOfTokens, {
              form: buyer,
              value: 1,
            })
            .then(assert.fail)
            .catch((err) => {
              assert(
                err.message.includes("revert"),
                "value is equal to the number of tokens"
              );
              return tokenSaleInstance
                .buyTokens(800000, {
                  form: buyer,
                  value: numberOfTokens * tokenPrice,
                })
                .then(assert.fail)
                .catch((err) => {
                  assert(
                    err.message.includes("revert"),
                    "value is equal to the number of tokens"
                  );
                });
            });
        });
    });
  });

  it("ends token sale", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return MyTokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch((err) => {
        assert(err.message.includes("revert", "must be admin to end the sale"));
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then((receipt) => {
        return tokenInstance.balanceOf(admin);
      })
      .then((balance) => {
        assert.strictEqual(
          balance.toNumber(),
          999990,
          "returns all unsold dapp tokens to admin"
        );
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.strictEqual(price.toNumber(), 0, "token price was rest");
      });
  });
});
