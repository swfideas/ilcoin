(function(angular) {
  'use strict';
  angular.module('myApp.controllers')
  .controller('coinMarketController', [
    '$scope','$resource', '$filter', '$timeout','$q',
    'DTOptionsBuilder', 'DTColumnBuilder', 'coinMarketFactory','dataService',
    function($scope, $resource, $filter, $timeout, $q,
      DTOptionsBuilder, DTColumnBuilder, coinMarketFactory, dataService) {

      console.log('coinMarketController');

      $scope.status;
      $scope.ilcoinTmp;
      $scope.ilcoinTmpIndex;
      $scope.ilcoinTmpParams = setTempNode();
      $scope.pageNumber = 1;
      $scope.pageLength = 100;
      $scope.totalEl;
      $scope.globalData;

      var vm = this;
      vm.authorized = false;
      vm.globalData = dataService.globalData($scope.config['GLOBALS_URL'])
      .then(function(response){
         $scope.globalData = response.data;
      });

      $scope.$watch('vm.globalData', function() {
        console.log('vm.globalData',vm.globalData);
      });
      var getTableData = function() {
          var deferred = $q.defer();
          deferred.resolve(dataService.allData(1)); 
          return deferred.promise;
      };

      vm.dtInstance = {};
      vm.dtOptions = DTOptionsBuilder.fromFnPromise(
        getTableData()
      )
      // vm.dtOptions = DTOptionsBuilder.newOptions()
      .withOption('pageLength', $scope.pageLength)
      .withPaginationType('full_numbers')
      .withOption('authorized', true);

      vm.dtColumns = [
        DTColumnBuilder.newColumn('number/_source').withTitle('#'),
        DTColumnBuilder.newColumn('name_link/_text').withTitle('Name').renderWith(imgCellLabel).withClass('font-bold'),
        DTColumnBuilder.newColumn('marketcap_price/_source').withTitle('Market Cap').withClass('no-wrap text-right').withOption('defaultContent', defaultValue()),
        DTColumnBuilder.newColumn('price_link/_text').withTitle('Price').withClass('no-wrap text-right text-bold').withOption('defaultContent', defaultValue()),
        DTColumnBuilder.newColumn('available_link/_text').withTitle('Avaiable Supply').withClass('no-wrap text-right').withOption('defaultContent', defaultValue()),
        DTColumnBuilder.newColumn('volume24h_link/_text').withTitle('Volume (24h)').withClass('no-wrap text-right').withOption('defaultContent', defaultValue()),
        DTColumnBuilder.newColumn('change24h_value').withTitle('% Change (24h)').renderWith(percentLabel).withClass('no-wrap text-right').withOption('defaultContent', defaultValue()),
        DTColumnBuilder.newColumn('pricegraph7d_image').withTitle('Price Graph (7d)').renderWith(imgCellGraph).withClass('no-wrap').notSortable(),
      ];

      vm.newPromise = newPromise;
      vm.reloadData = reloadData;
      vm.nextPage = nextPage;
      vm.dtInstance = {};
      function newPromise() {
        console.info('vm -> newPromise');
        return coinMarketFactory.getPage($scope.pageNumber+1);//$resource(coinMarketFactory.getPage($scope.pageNumber+1)).query().$promise;
      };

      function reloadData() {
        console.info('vm -> reloadData');
          var resetPaging = true;
          vm.dtInstance.reloadData(callback, resetPaging);
      };

      function callback(json) {
        console.info('vm -> callback');
          console.log(json);
      };

      function nextPage () {
        vm.dtInstance.changeData(coinMarketFactory.getPage($scope.pageNumber+1));
        vm.dtInstance.rerender();
      };

      // -------------------------------------------------
      function setTempNode() {
        console.log('[1] setTempNode');
        $scope.ilcoinTmpIndex = getRandomInt(5,15);
        $scope.ilcoinTmp = {
          "marketcap_price/_currency": "USD",
          "available_link_numbers/_source": "104,755,184,269",
          "marketcap_price/_source": "$ 33,555,914",
          "number": $scope.ilcoinTmpIndex,
          "name_link/_text": "ILCoin",
          "name_link/_source": "/currencies/ilcoin/",
          "number/_source": $scope.ilcoinTmpIndex.toString(),
          "price_link/_source": "/currencies/ilcoin/#markets",
          "available_link": "http://dogechain.info/chain/ILCoin",
          "name_image/_source": "/static/img/coins/16x16/ilcoin.png",
          "price_link/_text": "$ 0.000320",
          "pricegraph7d_link/_source": "/currencies/ilcoin/#charts",
          "available_link/_text": "104,755,184,269 ILC",
          "volume24h_link": "http://coinmarketcap.com/currencies/ilcoin/#markets",
          "name_link": "http://coinmarketcap.com/currencies/ilcoin/",
          "name_image": "http://coinmarketcap.com/static/img/coins/16x16/ilcoin.png",
          "marketcap_price": 33555914,
          "name_image/_alt": "ILCoin",
          "available_link_numbers": 104755184269,
          "pricegraph7d_image/_alt": "sparkline",
          "volume24h_link/_text": "$ 1,592,390",
          "pricegraph7d_link": "http://coinmarketcap.com/currencies/ilcoin/#charts",
          "price_link": "http://coinmarketcap.com/currencies/ilcoin/#markets",
          "pricegraph7d_image": "https://files.coinmarketcap.com/generated/sparklines/74.png",
          "volume24h_link/_source": "/currencies/ilcoin/#markets",
          "change24h_value": "15.60 %"
        };
        console.log('coinMarketFactory.setTmpNode->');
        coinMarketFactory.setTmpNode([$scope.ilcoinTmpIndex,$scope.ilcoinTmp]);
        return coinMarketFactory.getTmpNode;
      };

      function setGlobalData (){
        console.log('[00] getGlobalData');
        return coinMarketFactory.getGlobalData;
      };

      // function reloadData() {
      //   var resetPaging = false;
      //   vm.dtInstance.reloadData(callback, resetPaging);
      // };

      // function callback(json) { console.log(json); };
      // function test() { return console.log('test'); };

      function imgCellLabel(data, type, full, meta) {
        var path = full['name_image/_source'];
        return '<img src=".'+ path +'" alt="' + full['name_image/_alt'] + '-logo" class="currency-logo"/>' + ' ' + data ;
      };

      function imgCellGraph(data, type, full, meta) {
        var path = full['pricegraph7d_image'];
        return '<img class="sparkline" alt="sparkline" src="'+path+'">';
      };

      function percentLabel(data, type, full, meta) {
        var result = ( parseFloat(data) > 0 )? "pct-positive" : "pct-negative";
        var htmlStr = "<span class='"+result+"'>"+data+"</span>";
        return htmlStr ;
      };

      function defaultValue() {
        var htmlStr = "<p class='text-center text-muted'> ? </p>";
        return htmlStr ;
      };

      function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

    }]);
  })(window.angular);