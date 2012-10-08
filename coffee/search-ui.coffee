
queryServer = (queryString) ->
    $.ajax(
        {url: 'http://metropolis.informatik.uni-freiburg.de:28451/',
        data: {query: queryString, callback: "test"},
        dataType: 'jsonp',
        success: (data) ->
            $('#resultDiv').html("<pre> #{JSON.stringify(data, '<br/>', '\t')} </pre>")
        }
    )
$('#queryForm').submit(() -> 
    queryServer($('#queryInput').val())
    return false
)