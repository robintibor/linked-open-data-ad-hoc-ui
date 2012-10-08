(function() {
  var queryServer;

  queryServer = function(queryString) {
    return $.ajax({
      url: 'http://metropolis.informatik.uni-freiburg.de:28451/',
      data: {
        query: queryString,
        callback: "test"
      },
      dataType: 'jsonp',
      success: function(data) {
        return $('#resultDiv').html("<pre> " + (JSON.stringify(data, '<br/>', '\t')) + " </pre>");
      }
    });
  };

  $('#queryForm').submit(function() {
    queryServer($('#queryInput').val());
    return false;
  });

}).call(this);
