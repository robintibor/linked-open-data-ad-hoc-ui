canGetMoreResults = false
currentSearchOffset = 0
currentSearch =  ""

queryServer = () ->
    $.ajax(
        {url: 'http://metropolis.informatik.uni-freiburg.de:28451/',
        data: {query: currentSearch, offset: currentSearchOffset, callback: "test"},
        dataType: 'jsonp',
        success: (data) ->
            resultHTML = createResultHTML(data)
            addResultHTMLToResultDiv(resultHTML)
            if (data.documents.length > 0)
                currentSearchOffset += data.documents.length
                getMoreResultsOnScrollDown()
            else
                canGetMoreResults = false
        }
    )

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

getMoreResultsOnScrollDown = ->
    canGetMoreResults = true
    $(window).scroll(() ->
        if (atBottomOfPage())
            if (canGetMoreResults)
                canGetMoreResults = false
                getMoreResults()
    )
    
getMoreResults = ->
    queryServer()
        
atBottomOfPage = ->        
    currentScroll = $(document).scrollTop()
    totalHeight = document.body.offsetHeight
    visibleHeight = window.innerHeight
    return totalHeight - (visibleHeight + currentScroll)  <= 100 
    
addSubmitFunctionToQueryForm = ->
    $('#queryForm').submit(() -> 
        currentSearchOffset = 0
        currentSearch = $('#queryInput').val()
        $('#resultDiv').html('')
        queryServer()
        return false
    )

addSubmitFunctionToQueryForm()
