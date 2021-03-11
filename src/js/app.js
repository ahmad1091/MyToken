App = {
  web3Provider: null,
  contracts: [],
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: () => {
    console.log("App initialized ..");
    return App.initWeb3();
  },

  initWeb3: () => {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:8545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: () => {
    $.getJSON("MyTokenSale.json", (myTokenSale) => {
      App.contracts.MyTokenSale = TruffleContract(myTokenSale);
      App.contracts.MyTokenSale.setProvider(App.web3Provider);
      App.contracts.MyTokenSale.deployed().then((myTokenSale) => {
        console.log("token SaleAdress;;", myTokenSale.address);
      });
    }).done(() => {
      $.getJSON("MyToken.json", (myToken) => {
        App.contracts.MyToken = TruffleContract(myToken);
        App.contracts.MyToken.setProvider(App.web3Provider);
        App.contracts.MyToken.deployed().then((myToken) => {
          console.log("token Adress;;", myToken.address);
        });
        App.listenForEvents();

        return App.render();
      });
    });
  },

  listenForEvents: () => {
    App.contracts.MyTokenSale.deployed().then((instance) => {
      instance
        .Sell(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch((err, event) => {
          console.log("event triggered", event);
          App.render();
        });
    });
  },

  render: () => {
    if (App.loading) {
      return;
    }
    App.loading = true;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase((err, account) => {
      if (!err) {
        App.account = account;
        $("#accountAddress").html("Your Account:" + account);
      }
    });

    App.contracts.MyTokenSale.deployed()
      .then((instance) => {
        myTokenSaleInstance = instance;
        return myTokenSaleInstance.tokenPrice();
      })
      .then((tokenPrice) => {
        App.tokenPrice = tokenPrice;
        $(".token-price").html(
          web3.fromWei(App.tokenPrice, "ether").toNumber()
        );
        return myTokenSaleInstance.tokenSold();
      })
      .then((tokensSold) => {
        App.tokensSold = tokensSold.toNumber();
        $(".tokens-sold").html(App.tokensSold);
        $(".tokens-available").html(App.tokensAvailable);

        var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
        $("#progress").css("width", progressPercent + "%");
        App.contracts.MyToken.deployed()
          .then((instance) => {
            myTokenInstance = instance;
            return myTokenInstance.balanceOf(App.account);
          })
          .then((balance) => {
            $(".my-balance").html(balance.toNumber());
            // .done(() => {
            App.loading = false;
            loader.hide();
            content.show();
            // });
          });
      });
  },

  buyTokens: () => {
    $("#content").hide();
    $("#loader").show();
    var numberOfTokens = $("#numberOfTokens").val();
    App.contracts.MyTokenSale.deployed()
      .then((instance) => {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000,
        });
      })
      .then((result) => {
        console.log("Tokens bought");
        $("form").trigger("reset");
      });
  },
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
