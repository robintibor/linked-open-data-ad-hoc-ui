(function() {
  var addResultHTMLToResultDiv, addSubmitFunctionToQueryForm, atBottomOfPage, canGetMoreResults, createResultHTML, createResultHTMLForDocument, createSnippetHTML, createSnippetsHTML, currentSearch, currentSearchOffset, getMoreResults, getMoreResultsOnScrollDown, queryServer;

  canGetMoreResults = false;

  currentSearchOffset = 0;

  currentSearch = "";

  queryServer = function() {
    return $.ajax({
      url: 'http://metropolis.informatik.uni-freiburg.de:28451/',
      data: {
        query: currentSearch,
        offset: currentSearchOffset,
        callback: "test"
      },
      dataType: 'jsonp',
      success: function(data) {
        var resultHTML;
        resultHTML = createResultHTML(data);
        addResultHTMLToResultDiv(resultHTML);
        if (data.documents.length > 0) {
          currentSearchOffset += data.documents.length;
          return getMoreResultsOnScrollDown();
        } else {
          return canGetMoreResults = false;
        }
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
    return $('#resultDiv').append(resultHTML);
  };

  getMoreResultsOnScrollDown = function() {
    canGetMoreResults = true;
    return $(window).scroll(function() {
      if (atBottomOfPage()) {
        if (canGetMoreResults) {
          canGetMoreResults = false;
          return getMoreResults();
        }
      }
    });
  };

  getMoreResults = function() {
    return queryServer();
  };

  atBottomOfPage = function() {
    var currentScroll, totalHeight, visibleHeight;
    currentScroll = $(document).scrollTop();
    totalHeight = document.body.offsetHeight;
    visibleHeight = window.innerHeight;
    return totalHeight - (visibleHeight + currentScroll) <= 100;
  };

  addSubmitFunctionToQueryForm = function() {
    return $('#queryForm').submit(function() {
      currentSearchOffset = 0;
      currentSearch = $('#queryInput').val();
      $('#resultDiv').html('');
      queryServer();
      return false;
    });
  };

  addSubmitFunctionToQueryForm();

}).call(this);
