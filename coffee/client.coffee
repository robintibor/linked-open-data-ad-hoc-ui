window.lod = window.lod || {}

queryServer = (queryData, callback) ->
    $.ajax(
        {
            url: window.lod.host,
            data: queryData, 
            dataType: 'jsonp',
            success: callback
        }
    )

window.lod.callMethodOnServer = (options) ->
    # Calling the method by using JSON RPC 2.0, see http://www.jsonrpc.org/specification
    queryServer(
        {
            type : "JSONRPCCALL",
            jsonRPCObject: JSON.stringify({ 
                # have to stringify JSONRPCObject for some reason.. (?)
                jsonrpc: "2.0",
                method : options.method,
                params : options.parameters,
                id : Date.now() # hopefully will be unique :) Actually ignoring this parameter so its ok ;)
            })
        },
        (data) ->
            console.log("Response from server for #{options.method}:", data)
            options.callback(data.result)
    )