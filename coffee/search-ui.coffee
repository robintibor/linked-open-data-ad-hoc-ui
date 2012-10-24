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
    if (resultHasNoDocuments(data))
        return noResultsMessage()
    resultDocumentsHTML = ""
    for doc in data.documents
        resultDocumentsHTML += createResultHTMLForDocument(doc)
    return resultDocumentsHTML

resultHasNoDocuments = (data) ->
    return data.documents.length == 0

noResultsMessage = ->
        return "<div class='pagination-centered'>No Results. Try using <a href='http://broccoli.informatik.uni-freiburg.de/'>Broccoli</a> :)</div>"

createResultHTMLForDocument = (doc) ->
    snippetsHTML = createSnippetsHTML(doc)
    formattedScore = doc.score.toFixed(3)
    cleanDocTitle = unescapeUnicode(restoreUniCodeEscapeSequences(doc.title))
    cleanURL = unescapeUnicode(doc.url)
    return "<div class='oneResult'>
            <div class='resultHeader'><span class='resultTitle'><a href='#{cleanURL}'>#{cleanDocTitle}</a></span><span class='resultScore'>#{formattedScore}</span></div>
            <div class='resultURL'><a href='#{cleanURL}'>#{cleanURL}</a></div>
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


# Hacky hackay way of restoring uncide escape sequences that were split by an udnerscore in our intiial parsing process
#it can happen that somethign like \u017E gets split into \u017_E, and then we have to revert this split
# the split is initally hapenning to split words in the title...
restoreUniCodeEscapeSequences = (title) ->
    brokenUnicodeEscapeRegExp = /\\u[\d\w]{1,3}_/gi;
    console.log("title before", title)
    while (title.match(brokenUnicodeEscapeRegExp))
        title = title.replace(brokenUnicodeEscapeRegExp,
            (match, group) ->
                console.log("broken match: #{group}", match, group)
                console.log("replacing with: #{match.replace('_', '')}")
                return match.replace('_', '')
        )
        console.log("title after", title)
    return title

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
