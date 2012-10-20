canGetMoreResults = false
currentSearchOffset = 0
currentSearch =  ""
config = window.lod

queryServer = (queryData, callback) ->
    $.ajax(
        {
            url: config.host,
            data: queryData, 
            dataType: 'jsonp',
            success: callback
        }
    )

callMethodOnServer = (methodName, methodParameters, callback) ->
    # Calling the method by using JSON RPC 2.0, see http://www.jsonrpc.org/specification
    queryServer(
        {
            type : "JSONRPCCALL",
            jsonRPCObject: JSON.stringify({ 
                # have to stringify JSONRPCObject for some reason.. (?)
                jsonrpc: "2.0",
                method : methodName,
                params : methodParameters,
                id : Date.now() # hopefully will be unique :) Actually ignoring this parameter so its ok ;)
            })
        },
        (data) ->
            console.log("Response:", data)
            callback(data.result)
    )

sendSearchQueryToServer = ->
    callMethodOnServer("querySearchEngine", 
        [currentSearch, currentSearchOffset],
        (data) ->
            removeLoadingMonkey()
            resultHTML = createResultHTML(data)
            addResultHTMLToResultDiv(resultHTML)
            toggleResultsOnScrollDown(data.documents.length)
        
    )

removeLoadingMonkey = ->
    $('#loadingMonkey').remove()

createResultHTML = (data) ->
    resultDocumentsHTML = ""
    for doc in data.documents
        resultDocumentsHTML += createResultHTMLForDocument(doc)
    return resultDocumentsHTML

createResultHTMLForDocument = (doc) ->
    snippetHTML = createSnippetsHTML(doc)
    return "<div class='oneResult'>
            <div class='resultHeader'><span class='resultTitle'>#{doc.title}</span><span class='resultScore'>#{doc.score}</span></div>
            <div>#{snippetHTML}</div>
            </div>"

createSnippetsHTML = (doc) ->
    snippetHTML = ""
    for snippet in doc.snippets
        snippetHTML += createSnippetHTML(snippet)
    return snippetHTML

createSnippetHTML = (snippet) ->
    return "<div class='snippet'><span class='fieldName'>#{snippet.fieldName}</span><div class='snippetText'>#{snippet.text}</div></div>"

addResultHTMLToResultDiv = (resultHTML) ->
    $('#resultDiv').append(resultHTML)

toggleResultsOnScrollDown = (numberOfDocumentsForLastSearch) ->
    if (numberOfDocumentsForLastSearch > 0)
        currentSearchOffset += numberOfDocumentsForLastSearch
        ensureMoreResultsOnScrollDown()
    else
        disableMoreResultsOnScrollDown()

ensureMoreResultsOnScrollDown = ->
    canGetMoreResults = true

disableMoreResultsOnScrollDown = ->
    canGetMoreResults = false

getMoreResultsOnScrollDown = ->
    $(window).scroll(() ->
        if (atBottomOfPage())
            if (canGetMoreResults)
                canGetMoreResults = false
                getMoreResults()
    )
    
getMoreResults = ->
    addLoadingMonkey()
    sendSearchQueryToServer()
        
atBottomOfPage = ->        
    currentScroll = $(document).scrollTop()
    totalHeight = document.body.offsetHeight
    visibleHeight = window.innerHeight
    return totalHeight - (visibleHeight + currentScroll)  <= 100 
    
addSubmitFunctionToQueryForm = ->
    $('#queryForm').submit(() ->
        resetSearchValues()
        clearResultDiv()
        addLoadingMonkey()
        sendSearchQueryToServer()
        return false
    )

resetSearchValues = ->
    currentSearchOffset = 0
    currentSearch = $('#queryInput').val()

clearResultDiv = ->
    $('#resultDiv').html('')


addLoadingMonkey = ->
    $('#resultDiv').append("<img id='loadingMonkey' src='http://thedancingmonkey.webs.com/monkey.gif'/>")

askForFieldWeights = () ->
    queryServer(
        {type: 'ENGINEPARAMETERS'},
        (data) ->
            console.log("parameters: #{JSON.stringify(data)}")
    )

addSubmitFunctionToQueryForm()
getMoreResultsOnScrollDown()
askForFieldWeights()
