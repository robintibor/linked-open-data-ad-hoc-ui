queryServer = (queryString) ->
    $.ajax(
        {url: 'http://metropolis.informatik.uni-freiburg.de:28451/',
        data: {query: queryString, callback: "test"},
        dataType: 'jsonp',
        success: (data) ->
            $('#resultDiv').html("<pre> #{JSON.stringify(data, '<br/>', '\t')} </pre>")
            resultHTML = createResultHTML(data)
            addResultHTMLToResultDiv(resultHTML)
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
    $('#resultDiv').prepend(resultHTML)

$('#queryForm').submit(() -> 
    queryServer($('#queryInput').val())
    return false
)