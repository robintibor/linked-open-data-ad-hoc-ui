(function() {
  var addLoadingMonkey, addResultHTMLToResultDiv, addSubmitFunctionToQueryForm, askForFieldWeights, atBottomOfPage, callMethodOnServer, canGetMoreResults, clearResultDiv, config, createResultHTML, createResultHTMLForDocument, createSnippetHTML, createSnippetsHTML, currentSearch, currentSearchOffset, disableMoreResultsOnScrollDown, ensureMoreResultsOnScrollDown, getMoreResults, getMoreResultsOnScrollDown, queryServer, removeLoadingMonkey, resetSearchValues, restoreUniCodeEscapeSequences, sendSearchQueryToServer, toggleResultsOnScrollDown, unescapeUnicode;

  canGetMoreResults = false;

  currentSearchOffset = 0;

  currentSearch = "";

  config = window.lod;

  queryServer = function(queryData, callback) {
    return $.ajax({
      url: config.host,
      data: queryData,
      dataType: 'jsonp',
      success: callback
    });
  };

  callMethodOnServer = function(options) {
    return queryServer({
      type: "JSONRPCCALL",
      jsonRPCObject: JSON.stringify({
        jsonrpc: "2.0",
        method: options.method,
        params: options.parameters,
        id: Date.now()
      })
    }, function(data) {
      console.log("Response:", data);
      return options.callback(data.result);
    });
  };

  sendSearchQueryToServer = function() {
    return callMethodOnServer({
      method: "querySearchEngine",
      parameters: [currentSearch, currentSearchOffset],
      callback: function(data) {
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
    var cleanDocTitle, cleanURL, formattedScore, snippetsHTML;
    snippetsHTML = createSnippetsHTML(doc);
    formattedScore = doc.score.toFixed(3);
    cleanDocTitle = unescapeUnicode(restoreUniCodeEscapeSequences(doc.title));
    cleanURL = unescapeUnicode(doc.url);
    return "<div class='oneResult'>            <div class='resultHeader'><span class='resultTitle'><a href='" + cleanURL + "'>" + doc.title + "</a></span><span class='resultScore'>" + formattedScore + "</span></div>            <div class='resultURL'><a href='" + cleanURL + "'>" + cleanURL + "</a></div>            " + snippetsHTML + "            </div>";
  };

  createSnippetsHTML = function(doc) {
    var snippet, snippetHTML, _i, _len, _ref;
    snippetHTML = "";
    _ref = doc.snippets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      snippet = _ref[_i];
      snippetHTML += createSnippetHTML(snippet);
    }
    return "<table class='snippetTable'>" + snippetHTML + "</table>";
  };

  createSnippetHTML = function(snippet) {
    var cleanSnippetText;
    cleanSnippetText = unescapeUnicode(snippet.text);
    return "<tr><td class='fieldName'>" + snippet.fieldName + "</td><td class='snippetText'>" + cleanSnippetText + "</td></tr>";
  };

  unescapeUnicode = function(text) {
    var unicodeEscapeRegExp;
    unicodeEscapeRegExp = /\\u([\d\w]{4})/gi;
    text = text.replace(unicodeEscapeRegExp, function(match, group) {
      return String.fromCharCode(parseInt(group, 16));
    });
    text = unescape(text);
    return text;
  };

  restoreUniCodeEscapeSequences = function(title) {
    return title;
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
    return sendSearchQueryToServer();
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
      sendSearchQueryToServer();
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
    return $('#resultDiv').append("<img id='loadingMonkey' class='loadingMonkeyImage' src='http://thedancingmonkey.webs.com/monkey.gif'/>");
  };

  askForFieldWeights = function() {
    return callMethodOnServer({
      method: "getEngineParameters",
      callback: function(data) {
        return console.log("parameters: " + (JSON.stringify(data)));
      }
    });
  };

  addSubmitFunctionToQueryForm();

  getMoreResultsOnScrollDown();

  askForFieldWeights();

}).call(this);
