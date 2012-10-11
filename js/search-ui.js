(function() {
  var addLoadingMonkey, addResultHTMLToResultDiv, addSubmitFunctionToQueryForm, askForFieldWeights, atBottomOfPage, canGetMoreResults, clearResultDiv, createResultHTML, createResultHTMLForDocument, createSnippetHTML, createSnippetsHTML, currentSearch, currentSearchOffset, disableMoreResultsOnScrollDown, ensureMoreResultsOnScrollDown, getMoreResults, getMoreResultsOnScrollDown, queryServer, removeLoadingMonkey, resetSearchValues, toggleResultsOnScrollDown;

  canGetMoreResults = false;

  currentSearchOffset = 0;

  currentSearch = "";

  queryServer = function() {
    return $.ajax({
      url: 'http://metropolis.informatik.uni-freiburg.de:28452/',
      data: {
        query: currentSearch,
        offset: currentSearchOffset
      },
      dataType: 'jsonp',
      success: function(data) {
        var resultHTML;
        removeLoadingMonkey();
        resultHTML = createResultHTML(data);
        addResultHTMLToResultDiv(resultHTML);
        return toggleResultsOnScrollDown(data.documents.length);
      }
    });
  };

  removeLoadingMonkey = function() {
    return $('#loadingMonkey').remove();
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

  toggleResultsOnScrollDown = function(numberOfDocumentsForLastSearch) {
    if (numberOfDocumentsForLastSearch > 0) {
      currentSearchOffset += numberOfDocumentsForLastSearch;
      return ensureMoreResultsOnScrollDown();
    } else {
      return disableMoreResultsOnScrollDown();
    }
  };

  ensureMoreResultsOnScrollDown = function() {
    return canGetMoreResults = true;
  };

  disableMoreResultsOnScrollDown = function() {
    return canGetMoreResults = false;
  };

  getMoreResultsOnScrollDown = function() {
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
    addLoadingMonkey();
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
      resetSearchValues();
      clearResultDiv();
      addLoadingMonkey();
      queryServer();
      return false;
    });
  };

  resetSearchValues = function() {
    currentSearchOffset = 0;
    return currentSearch = $('#queryInput').val();
  };

  clearResultDiv = function() {
    return $('#resultDiv').html('');
  };

  addLoadingMonkey = function() {
    return $('#resultDiv').append("<img id='loadingMonkey' src='http://thedancingmonkey.webs.com/monkey.gif'/>");
  };

  askForFieldWeights = function() {
    return $.ajax({
      url: 'http://metropolis.informatik.uni-freiburg.de:28452/GETPARAMETERS',
      data: {
        query: currentSearch,
        offset: currentSearchOffset
      },
      dataType: 'jsonp',
      success: function(data) {
        var resultHTML;
        resultHTML = createResultHTML(data);
        addResultHTMLToResultDiv(resultHTML);
        return toggleResultsOnScrollDown(data.documents.length);
      }
    });
  };

  addSubmitFunctionToQueryForm();

  getMoreResultsOnScrollDown();

}).call(this);
