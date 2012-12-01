canGetMoreResults = false
currentSearchOffset = 0
currentSearch =  ""
lod = window.lod
    
addSubmitFunctionToQueryForm = ->
    $('#queryForm').submit(() ->
        resetSearchValues()
        clearResultDiv()
        addLoadingMonkey()
        sendSearchQueryToServer()
        logQueryInBrowserHistory()
        return false
    )

resetSearchValues = ->
    currentSearchOffset = 0
    currentSearch = $('#queryInput').val()

clearResultDiv = ->
    $('#resultDiv').html('')


addLoadingMonkey = ->
    $('#resultDiv').append("<img id='loadingMonkey' class='loadingMonkeyImage' src='http://thedancingmonkey.webs.com/monkey.gif'/>")

sendSearchQueryToServer = ->
    window.lod.callMethodOnServer(
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

logQueryInBrowserHistory = () ->
    # check if the submit was caused by a pushing of the back or forward buttons
    # in this case the url should already be correct (containt he query string), 
    # and no new state should be pushed!
    if (currentSearch != extractQueryStringFromCurrentLocation())
        window.History.pushState({queryString:currentSearch}, "Search State", "?query=#{currentSearch}")

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
    while (title.match(brokenUnicodeEscapeRegExp))
        title = title.replace(brokenUnicodeEscapeRegExp,
            (match, group) ->
                return match.replace('_', '')
        )
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


askForFieldWeights = () ->
    window.lod.callMethodOnServer(
        { 
            method: "getEngineParameters",
            callback: (data) ->
               showURLParameters(data.domainScores)
        }
    )

showURLParameters = (urlParameters) ->
    # sort url parameters by score descending :)
    urlParameters.sort((urlParameterA, urlParameterB) -> 
        urlParameterB.score - urlParameterA.score
        )
        
    for urlParameter in urlParameters
        parameterTextBox = $('.urlParameters')
        urlParametersLine = createURLParameterLine(urlParameter)
        oldParameterText = parameterTextBox.val()
        parameterTextBox.val("#{oldParameterText}#{urlParametersLine}\n")
    # remove last newLine
    oldText = parameterTextBox.val()
    parameterTextBox.val(oldText[0...oldText.length - 1])

createURLParameterLine = (urlParameter) ->
    return "#{urlParameter.url}\t#{urlParameter.score}"

checkURLHrefForQueryString = () ->
    # querystring should be like query=testQueryString :)
    # e.g. http://localhost:3131/workspace/linked-open-data-ad-hoc-ui/index.html?query=testQueryString
    queryString = extractQueryStringFromCurrentLocation()
    if (queryString? and queryString != "")
        enterAndSubmitQueryAsUser(queryString)

extractQueryStringFromCurrentLocation =  () ->
     # querystring should be like query=testQueryString :)
    # e.g. http://localhost:3131/workspace/linked-open-data-ad-hoc-ui/index.html?query=testQueryString
    possibleQueryString = window.location.href.match(/query=([^&]*)/)
    if (possibleQueryString? and possibleQueryString.length == 2)
        queryString = window.location.href.match(/query=([^&]*)/)[1]
        queryString = unescape(queryString)
    return queryString

enterAndSubmitQueryAsUser = (queryString) ->
    $('#queryInput').val(queryString).submit()

enableBrowserHistory = () ->
    History = window.History
    History.Adapter.bind(window,'statechange', () ->
        State = History.getState(); 
        queryString = extractQueryStringFromCurrentLocation()
        if (not queryString)
            clearSearch()
        else if (queryString != currentSearch)
            enterAndSubmitQueryAsUser(queryString)
    )
clearSearch = () ->
    currentSearchOffset = 0
    currentSearch = ""
    $('#queryInput').val('')
    clearResultDiv()

changeURLParametersOnLostFocus = ->
    $('.urlParameters').blur(updateURLParameters)

updateURLParameters = ->
    urlParameters = extractUrlParametersOfTextArea()
    sendURLParametersToServer(urlParameters)

extractUrlParametersOfTextArea = ->
    urlParameters = []
    urlParameterText = $('.urlParameters').val()
    urlParameterStrings = urlParameterText.split('\n')
    for urlParameterString in urlParameterStrings
        urlParameter = createUrlParameter(urlParameterString)
        if urlParameter?
            urlParameters.push(urlParameter)
    return urlParameters

createUrlParameter = (urlParameterString) ->
    urlAndScore = urlParameterString.split(/\s+/g)
    urlAndScorePresent = urlAndScore.length == 2
    if (urlAndScorePresent)
        return {
            url: urlAndScore[0],
            score: parseFloat(urlAndScore[1])
        }
    else
        return null

sendURLParametersToServer = (urlParameters) ->
    window.lod.callMethodOnServer(
        { 
            method: "setEngineParameters",
            parameters: [JSON.stringify(urlParameters)],
            callback: (data) ->
                
        }
        $('#queryInput').submit()
    )

addSubmitFunctionToQueryForm()
getMoreResultsOnScrollDown()
askForFieldWeights()
checkURLHrefForQueryString()
enableBrowserHistory()
changeURLParametersOnLostFocus()
