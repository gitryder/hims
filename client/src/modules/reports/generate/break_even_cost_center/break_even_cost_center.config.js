angular.module('bhima.controllers')
  .controller('break_even_cost_centerController', breakEvenCostCenterController);

breakEvenCostCenterController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state', 'CostCenterService',
];

function breakEvenCostCenterController($sce, Notify, SavedReports, AppCache, reportData, $state, CostCenters) {
  const vm = this;
  const cache = new AppCache('configure_break_even_cost_center');
  const reportUrl = 'reports/finance/break_even_cost_center';
  vm.reportDetails = {};
  vm.costCenters = [];

  vm.previewGenerated = false;
  checkCachedConfiguration();

  vm.onSelectFiscalYear = (fiscalYear) => {
    vm.reportDetails.fiscal_id = fiscalYear.id;
    vm.reportDetails.fiscalYearStart = fiscalYear.start_date;
  };

  vm.onSelectPeriod = (period) => {
    vm.reportDetails.period_id = period.id;
    vm.reportDetails.end_date = period.end_date;
    vm.reportDetails.start_date = period.start_date;
  };

  vm.preview = function preview(form) {
    if (form.$invalid) { return null; }

    if (!vm.reportDetails.defineCostCenters) {
      vm.reportDetails.costCenters = [];
    }

    // update cached configuration
    cache.reportDetails = angular.copy(vm.reportDetails);

    return SavedReports.requestPreview(reportUrl, reportData.id, angular.copy(vm.reportDetails))
      .then((result) => {
        vm.previewGenerated = true;
        vm.previewResult = $sce.trustAsHtml(result);
      })
      .catch(Notify.handleError);
  };

  vm.clearPreview = function clearPreview() {
    vm.previewGenerated = false;
    vm.previewResult = null;
  };

  CostCenters.read(null, { is_principal : 1 })
    .then((data) => {
      vm.principalCostCenter = data;
    })
    .catch(Notify.handleError)
    .finally(() => {
      vm.loading = false;
    });

  vm.requestSaveAs = function requestSaveAs() {
    const options = {
      url : reportUrl,
      report : reportData,
      reportOptions : angular.copy(vm.reportDetails),
    };

    return SavedReports.saveAsModal(options)
      .then(() => {
        $state.go('reportsBase.reportsArchive', { key : options.report.report_key });
      })
      .catch(Notify.handleError);
  };

  function checkCachedConfiguration() {
    if (cache.reportDetails) {
      vm.reportDetails = angular.copy(cache.reportDetails);
    }
    vm.reportDetails.type = 1;
  }
}
