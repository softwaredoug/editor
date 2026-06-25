export class CorrectionsService {
  setCorrectionsDirectory(directory) {
    return window.api.setCorrectionsDirectory(directory);
  }

  checkCorrections(payload) {
    return window.api.checkCorrections(payload);
  }

  analyzeCorrections(payload) {
    return window.api.analyzeCorrections(payload);
  }

  applyIssue(payload) {
    return window.api.applyIssue(payload);
  }

  addDismissedChange(payload) {
    return window.api.addDismissedChange(payload);
  }

  addSpellingException(payload) {
    return window.api.addSpellingException(payload);
  }
}
