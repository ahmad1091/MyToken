App = {
  web3Provider: null,
  contracts: [],
  account: "0x0",
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
        return App.render();
      });
    });
  },
  render: () => {
    web3.eth.getCoinbase((err, account) => {
      if (!err) {
        console.log(account);
        App.account = account;
        $("#accountAddress").html("Your Account:" + account);
      }
    });
  },
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
