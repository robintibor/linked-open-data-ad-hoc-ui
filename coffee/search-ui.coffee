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

callMethodOnServer = (options) ->
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
            console.log("Response:", data)
            options.callback(data.result)
    )

sendSearchQueryToServer = ->
    callMethodOnServer(
        {
            method: "querySearchEngine",
            parameters: [currentSearch, currentSearchOffset],
            callback: (data) ->
                removeLoadingMonkey()
                resultHTML = createResultHTML(data)
                addResultHTMLToResultDiv(resultHTML)
                toggleResultsOnScrollDown(data.documents.length)
        }
    )

removeLoadingMonkey = ->
    $('#loadingMonkey').remove()

createResultHTML = (data) ->
    resultDocumentsHTML = ""
    for doc in data.documents
        resultDocumentsHTML += createResultHTMLForDocument(doc)
    return resultDocumentsHTML

createResultHTMLForDocument = (doc) ->
    snippetsHTML = createSnippetsHTML(doc)
    formattedScore = doc.score.toFixed(3)
    return "<div class='oneResult'>
            <div class='resultHeader'><span class='resultTitle'><a href='#{doc.url}'>#{doc.title}</a></span><span class='resultScore'>#{formattedScore}</span></div>
            <div class='resultURL'><a href='#{doc.url}'>#{doc.url}</a></div>
            #{snippetsHTML}
            </div>"

createSnippetsHTML = (doc) ->
    snippetHTML = ""
    for snippet in doc.snippets
        snippetHTML += createSnippetHTML(snippet)
    return "<table class='snippetTable'>#{snippetHTML}</table>"

createSnippetHTML = (snippet) ->
    cleanSnippetText = unescapeUnicode(snippet.text);
    return "<tr><td class='fieldName'>#{snippet.fieldName}</td><td class='snippetText'>#{cleanSnippetText}</td></tr>"

# http://stackoverflow.com/a/7885499/1469195
unescapeUnicode = (text) ->
    unicodeEscapeRegExp = /\\u([\d\w]{4})/gi;
    text = text.replace(unicodeEscapeRegExp, (match, group) ->
            return String.fromCharCode(parseInt(group, 16))
        )
    text = unescape(text)
    return text

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
    $('#resultDiv').append("<img id='loadingMonkey' class='loadingMonkeyImage' src='http://thedancingmonkey.webs.com/monkey.gif'/>")

askForFieldWeights = () ->
    callMethodOnServer(
        { 
            method: "getEngineParameters",
            callback: (data) ->
                console.log("parameters: #{JSON.stringify(data)}")
        }
    )

addSubmitFunctionToQueryForm()
getMoreResultsOnScrollDown()
askForFieldWeights()
