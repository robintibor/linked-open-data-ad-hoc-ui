(function() {
  var addLoadingMonkey, addResultHTMLToResultDiv, addSubmitFunctionToQueryForm, askForFieldWeights, atBottomOfPage, callMethodOnServerAndRepeatSearchOnResponse, canGetMoreResults, changeFieldWeightsOnLostFocus, changeURLParametersOnLostFocus, checkURLHrefForQueryString, clearResultDiv, clearSearch, createResultHTML, createResultHTMLForDocument, createSnippetHTML, createSnippetsHTML, createURLParameterLine, createUrlParameter, currentSearch, currentSearchOffset, disableMoreResultsOnScrollDown, enableBrowserHistory, ensureMoreResultsOnScrollDown, enterAndSubmitQueryAsUser, extractFieldWeights, extractQueryStringFromCurrentLocation, extractUrlParametersOfTextArea, getMoreResults, getMoreResultsOnScrollDown, lod, logQueryInBrowserHistory, noResultsMessage, putLoadingMonkeyOnTopOfPage, removeLoadingMonkey, removeLoadingMonkeyFromTopOfPage, resetSearchValues, restoreUniCodeEscapeSequences, resultHasNoDocuments, sendFieldWeightsToServer, sendSearchQueryToServer, sendURLParametersToServer, showFieldWeight, showFieldWeights, showURLParameters, submitCurrentlyEnteredQuery, toggleResultsOnScrollDown, unescapeUnicode, updateFieldWeights, updateURLParameters,
    __hasProp = {}.hasOwnProperty;

  canGetMoreResults = false;

  currentSearchOffset = 0;

  currentSearch = "";

  window.lod = window.lod || {};

  lod = window.lod;

  addSubmitFunctionToQueryForm = function() {
    return $('#queryForm').submit(submitCurrentlyEnteredQuery);
  };

  submitCurrentlyEnteredQuery = function() {
    resetSearchValues();
    clearResultDiv();
    addLoadingMonkey();
    sendSearchQueryToServer();
    logQueryInBrowserHistory();
    return false;
  };

  resetSearchValues = function() {
    currentSearchOffset = 0;
    return currentSearch = $('#queryInput').val();
  };

  clearResultDiv = function() {
    return $('#resultDiv').html('');
  };

  addLoadingMonkey = function() {
    return $('#resultDiv').append("<img id='loadingMonkey' class='loadingMonkeyImage' src='images/monkey.gif'/>");
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
      }, "Searching for " + currentSearch, "?query=" + currentSearch);
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
        return match.replace('_', '');
      });
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
      callback: function(data) {
        showURLParameters(data.domainScores);
        return showFieldWeights(data.fieldWeights);
      }
    });
  };

  showURLParameters = function(urlParameters) {
    var oldParameterText, oldText, parameterTextBox, urlParameter, urlParametersLine, _i, _len;
    urlParameters.sort(function(urlParameterA, urlParameterB) {
      return urlParameterB.score - urlParameterA.score;
    });
    for (_i = 0, _len = urlParameters.length; _i < _len; _i++) {
      urlParameter = urlParameters[_i];
      parameterTextBox = $('.urlParameters');
      urlParametersLine = createURLParameterLine(urlParameter);
      oldParameterText = parameterTextBox.val();
      parameterTextBox.val("" + oldParameterText + urlParametersLine + "\n");
    }
    oldText = parameterTextBox.val();
    return parameterTextBox.val(oldText.slice(0, oldText.length - 1));
  };

  showFieldWeights = function(fieldWeights) {
    var fieldName, weight, _results;
    _results = [];
    for (fieldName in fieldWeights) {
      if (!__hasProp.call(fieldWeights, fieldName)) continue;
      weight = fieldWeights[fieldName];
      _results.push(showFieldWeight(fieldName, weight));
    }
    return _results;
  };

  showFieldWeight = function(fieldName, weight) {
    var fieldBox;
    fieldBox = $("#" + fieldName + "Parameter");
    return fieldBox.val(weight);
  };

  createURLParameterLine = function(urlParameter) {
    return "" + urlParameter.url + "\t" + urlParameter.score;
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

  changeURLParametersOnLostFocus = function() {
    return $('.urlParameters').blur(updateURLParameters);
  };

  updateURLParameters = function() {
    var urlParameters;
    urlParameters = extractUrlParametersOfTextArea();
    return sendURLParametersToServer(urlParameters);
  };

  extractUrlParametersOfTextArea = function() {
    var urlParameter, urlParameterString, urlParameterStrings, urlParameterText, urlParameters, _i, _len;
    urlParameters = [];
    urlParameterText = $('.urlParameters').val();
    urlParameterStrings = urlParameterText.split('\n');
    for (_i = 0, _len = urlParameterStrings.length; _i < _len; _i++) {
      urlParameterString = urlParameterStrings[_i];
      urlParameter = createUrlParameter(urlParameterString);
      if (urlParameter != null) {
        urlParameters.push(urlParameter);
      }
    }
    return urlParameters;
  };

  createUrlParameter = function(urlParameterString) {
    var urlAndScore, urlAndScorePresent;
    urlAndScore = urlParameterString.split(/\s+/g);
    urlAndScorePresent = urlAndScore.length === 2;
    if (urlAndScorePresent) {
      return {
        url: urlAndScore[0],
        score: parseFloat(urlAndScore[1])
      };
    } else {
      return null;
    }
  };

  sendURLParametersToServer = function(urlParameters) {
    return callMethodOnServerAndRepeatSearchOnResponse({
      method: "setDomainWeights",
      parameters: [JSON.stringify(urlParameters)]
    });
  };

  callMethodOnServerAndRepeatSearchOnResponse = function(options) {
    window.lod.callMethodOnServer({
      method: options.method,
      parameters: options.parameters,
      callback: function(data) {
        removeLoadingMonkeyFromTopOfPage();
        if (currentSearch !== '') {
          return submitCurrentlyEnteredQuery();
        }
      }
    });
    return putLoadingMonkeyOnTopOfPage();
  };

  putLoadingMonkeyOnTopOfPage = function() {
    return $('body').prepend('<img src="images/monkey.gif" class="monkeyOnTopOfPage"/>');
  };

  removeLoadingMonkeyFromTopOfPage = function() {
    return $('.monkeyOnTopOfPage').remove();
  };

  changeFieldWeightsOnLostFocus = function() {
    return $('.fieldParameter').blur(updateFieldWeights);
  };

  updateFieldWeights = function() {
    var fieldWeights;
    fieldWeights = extractFieldWeights();
    return sendFieldWeightsToServer(fieldWeights);
  };

  extractFieldWeights = function() {
    return {
      title: parseFloat($('#titleParameter').val()),
      important: parseFloat($('#importantParameter').val()),
      neutral: parseFloat($('#neutralParameter').val()),
      unimportant: parseFloat($('#unimportantParameter').val())
    };
  };

  sendFieldWeightsToServer = function(fieldWeights) {
    return callMethodOnServerAndRepeatSearchOnResponse({
      method: "setFieldWeights",
      parameters: [JSON.stringify(fieldWeights)]
    });
  };

  addSubmitFunctionToQueryForm();

  getMoreResultsOnScrollDown();

  askForFieldWeights();

  checkURLHrefForQueryString();

  enableBrowserHistory();

  changeURLParametersOnLostFocus();

  changeFieldWeightsOnLostFocus();

}).call(this);
