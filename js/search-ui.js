(function() {
  var addResultHTMLToResultDiv, createResultHTML, createResultHTMLForDocument, createSnippetHTML, createSnippetsHTML, queryServer;

  queryServer = function(queryString) {
    return $.ajax({
      url: 'http://metropolis.informatik.uni-freiburg.de:28451/',
      data: {
        query: queryString,
        callback: "test"
      },
      dataType: 'jsonp',
      success: function(data) {
        var resultHTML;
        $('#resultDiv').html("<pre> " + (JSON.stringify(data, '<br/>', '\t')) + " </pre>");
        resultHTML = createResultHTML(data);
        return addResultHTMLToResultDiv(resultHTML);
      }
    });
  };

  createResultHTML = function(data) {
    var doc, resultDocumentsHTML, _i, _len, _ref;
    resultDocumentsHTML = "";
    _ref = data.documents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      doc = _ref[_i];
      resultDocumentsHTML += createResultHTMLForDocument(doc);
    }
    return resultDocumentsHTML;
  };

  createResultHTMLForDocument = function(doc) {
    var snippetHTML;
    snippetHTML = createSnippetsHTML(doc);
    return "<div class='oneResult'>            <div class='resultHeader'><span class='resultTitle'>" + doc.title + "</span><span class='resultScore'>" + doc.score + "</span></div>            <div>" + snippetHTML + "</div>            </div>";
  };

  createSnippetsHTML = function(doc) {
    var snippet, snippetHTML, _i, _len, _ref;
    snippetHTML = "";
    _ref = doc.snippets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      snippet = _ref[_i];
      snippetHTML += createSnippetHTML(snippet);
    }
    return snippetHTML;
  };

  createSnippetHTML = function(snippet) {
    return "<div class='snippet'><span class='fieldName'>" + snippet.fieldName + "</span><div class='snippetText'>" + snippet.text + "</div></div>";
  };

  addResultHTMLToResultDiv = function(resultHTML) {
    return $('#resultDiv').prepend(resultHTML);
  };

  $('#queryForm').submit(function() {
    queryServer($('#queryInput').val());
    return false;
  });

}).call(this);
