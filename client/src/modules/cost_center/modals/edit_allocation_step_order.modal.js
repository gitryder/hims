angular.module('bhima.controllers')
  .controller('AllocationEditStepOrderController', AllocationEditStepOrderController);

AllocationEditStepOrderController.$inject = [
  'CostCenterService', 'ModalService', 'NotifyService', 'uiGridConstants',
  '$uibModal', '$translate', 'GridStateService', '$state',
];

function AllocationEditStepOrderController(
  CostCenters, ModalService, Notify, uiGridConstants,
  Instance, $translate, GridState, $state) {

  const vm = this;

  vm.loading = false;
  vm.close = Instance.close;
  vm.loadCostCenters = loadCostCenters;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider: vm,
    enableColumnMenus: false,
    fastWatch: true,
    flatEntityAccess: true,
    enableSorting: false,
    onRegisterApi: onRegisterApiFn,
    columnDefs: [
      {
        field: 'label',
        displayName: 'FORM.LABELS.DESIGNATION',
        headerCellFilter: 'translate',
      },
      {
        field : 'step_order',
        displayName : 'COST_CENTER.STEP_ORDER',
        headerCellFilter : 'translate',
        headerCellClass : 'allocationBasisColHeader',
        // cellTemplate : '/modules/cost_center/templates/step_order.tmpl.html',
        type : 'number',
        visible : true,
      },
      {
        field: 'action',
        width: 80,
        displayName: '',
        cellTemplate: '/modules/cost_center/templates/action.tmpl.html',
        enableSorting: false,
        enableFiltering: false,
      },
    ],
  };

  function loadCostCenters() {
    vm.loading = true;
    CostCenters.read()
      .then((data) => {
        const auxData = data.filter(item => !item.is_principal);
        auxData.forEach(fc => {
          // Translate each cost center allocation basis name
          if (fc.allocation_basis.is_predefined) {
            fc.allocation_basis_name = $translate.instant(fc.allocation_basis.name);
            fc.allocation_basis_units = fc.allocation_basis.units ? $translate.instant(fc.allocation_basis.units) : '';
          } else {
            fc.allocation_basis_name = fc.allocation_basis.name;
            fc.allocation_basis_units = fc.allocation_basis.units;
          }
          if (fc.allocation_basis_units) {
            fc.allocation_basis_name += ` (${fc.allocation_basis_units})`;
          }
        });
        vm.gridOptions.data = auxData;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  loadCostCenters();
}
