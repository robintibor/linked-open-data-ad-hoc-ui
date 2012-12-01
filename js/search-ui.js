(function() {
  var addLoadingMonkey, addResultHTMLToResultDiv, addSubmitFunctionToQueryForm, askForFieldWeights, atBottomOfPage, canGetMoreResults, checkURLHrefForQueryString, clearResultDiv, clearSearch, createResultHTML, createResultHTMLForDocument, createSnippetHTML, createSnippetsHTML, currentSearch, currentSearchOffset, disableMoreResultsOnScrollDown, enableBrowserHistory, ensureMoreResultsOnScrollDown, enterAndSubmitQueryAsUser, extractQueryStringFromCurrentLocation, getMoreResults, getMoreResultsOnScrollDown, lod, logQueryInBrowserHistory, noResultsMessage, removeLoadingMonkey, resetSearchValues, restoreUniCodeEscapeSequences, resultHasNoDocuments, sendSearchQueryToServer, toggleResultsOnScrollDown, unescapeUnicode;

  canGetMoreResults = false;

  currentSearchOffset = 0;

  currentSearch = "";

  lod = window.lod;

  addSubmitFunctionToQueryForm = function() {
    return $('#queryForm').submit(function() {
      resetSearchValues();
      clearResultDiv();
      addLoadingMonkey();
      sendSearchQueryToServer();
      logQueryInBrowserHistory();
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

  sendSearchQueryToServer = function() {
    return window.lod.callMethodOnServer({
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

  logQueryInBrowserHistory = function() {
    if (currentSearch !== extractQueryStringFromCurrentLocation()) {
      return window.History.pushState({
        queryString: currentSearch
      }, "Search State", "?query=" + currentSearch);
    }
  };

  removeLoadingMonkey = function() {
    return $('#loadingMonkey').remove();
  };

  createResultHTML = function(data) {
    var doc, resultDocumentsHTML, _i, _len, _ref;
    if (resultHasNoDocuments(data)) {
      return noResultsMessage();
    }
    resultDocumentsHTML = "";
    _ref = data.documents;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      doc = _ref[_i];
      resultDocumentsHTML += createResultHTMLForDocument(doc);
    }
    return resultDocumentsHTML;
  };

  resultHasNoDocuments = function(data) {
    return data.documents.length === 0;
  };

  noResultsMessage = function() {
    return "<div class='pagination-centered'>No Results. Try using <a href='http://broccoli.informatik.uni-freiburg.de/'>Broccoli</a> :)</div>";
  };

  createResultHTMLForDocument = function(doc) {
    var cleanDocTitle, cleanURL, formattedScore, snippetsHTML;
    snippetsHTML = createSnippetsHTML(doc);
    formattedScore = doc.score.toFixed(3);
    cleanDocTitle = unescapeUnicode(restoreUniCodeEscapeSequences(doc.title));
    cleanURL = unescapeUnicode(doc.url);
    return "<div class='oneResult'>            <div class='resultHeader'><span class='resultTitle'><a href='" + cleanURL + "'>" + cleanDocTitle + "</a></span><span class='resultScore'>" + formattedScore + "</span></div>            <div class='resultURL'><a href='" + cleanURL + "'>" + cleanURL + "</a></div>            " + snippetsHTML + "            </div>";
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
    var brokenUnicodeEscapeRegExp;
    brokenUnicodeEscapeRegExp = /\\u[\d\w]{1,3}_/gi;
    while (title.match(brokenUnicodeEscapeRegExp)) {
      title = title.replace(brokenUnicodeEscapeRegExp, function(match, group) {
        console.log("broken match: " + group, match, group);
        console.log("replacing with: " + (match.replace('_', '')));
        return match.replace('_', '');
      });
      console.log("title after", title);
    }
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

  askForFieldWeights = function() {
    return window.lod.callMethodOnServer({
      method: "getEngineParameters",
      callback: function(data) {}
    });
  };

  checkURLHrefForQueryString = function() {
    var queryString;
    queryString = extractQueryStringFromCurrentLocation();
    if ((queryString != null) && queryString !== "") {
      return enterAndSubmitQueryAsUser(queryString);
    }
  };

  extractQueryStringFromCurrentLocation = function() {
    var possibleQueryString, queryString;
    possibleQueryString = window.location.href.match(/query=([^&]*)/);
    if ((possibleQueryString != null) && possibleQueryString.length === 2) {
      queryString = window.location.href.match(/query=([^&]*)/)[1];
      queryString = unescape(queryString);
    }
    return queryString;
  };

  enterAndSubmitQueryAsUser = function(queryString) {
    return $('#queryInput').val(queryString).submit();
  };

  enableBrowserHistory = function() {
    var History;
    History = window.History;
    return History.Adapter.bind(window, 'statechange', function() {
      var State, queryString;
      State = History.getState();
      queryString = extractQueryStringFromCurrentLocation();
      if (!queryString) {
        return clearSearch();
      } else if (queryString !== currentSearch) {
        return enterAndSubmitQueryAsUser(queryString);
      }
    });
  };

  clearSearch = function() {
    currentSearchOffset = 0;
    currentSearch = "";
    $('#queryInput').val('');
    return clearResultDiv();
  };

  addSubmitFunctionToQueryForm();

  getMoreResultsOnScrollDown();

  askForFieldWeights();

  checkURLHrefForQueryString();

  enableBrowserHistory();

}).call(this);
