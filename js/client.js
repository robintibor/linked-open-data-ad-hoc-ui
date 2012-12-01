(function() {
  var queryServer;

  window.lod = window.lod || {};

  queryServer = function(queryData, callback) {
    return $.ajax({
      url: window.lod.host,
      data: queryData,
      dataType: 'jsonp',
      success: callback
    });
  };

  window.lod.callMethodOnServer = function(options) {
    return queryServer({
      type: "JSONRPCCALL",
      jsonRPCObject: JSON.stringify({
        jsonrpc: "2.0",
        method: options.method,
        params: options.parameters,
        id: Date.now()
      })
    }, function(data) {
      console.log("Response:", data);
      return options.callback(data.result);
    });
  };

}).call(this);
