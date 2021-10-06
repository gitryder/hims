angular.module('bhima.controllers')
  .controller('AllocationEditStepOrderController', AllocationEditStepOrderController);

AllocationEditStepOrderController.$inject = [
  'CostCenterService', 'NotifyService', '$uibModalInstance', 'uiGridConstants',
];

function AllocationEditStepOrderController(CostCenters, Notify, Instance, uiGridConstants) {

  const vm = this;

  vm.loading = false;
  vm.close = Instance.close;
  vm.loadCostCenters = loadCostCenters;
  vm.moveStepDown = moveStepDown;
  vm.moveStepUp = moveStepUp;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider: vm,
    enableColumnMenus: false,
    fastWatch: true,
    flatEntityAccess: true,
    enableRowReordering: true,
    enableSorting: false,
    onRegisterApi: onRegisterApiFn,
    columnDefs: [
      {
        field : 'label',
        displayName : 'FORM.LABELS.DESIGNATION',
        headerCellFilter : 'translate',
        enableSorting : false,
      },
      {
        field : 'step_order',
        displayName : 'COST_CENTER.STEP_ORDER',
        headerCellFilter : 'translate',
        headerCellClass : 'allocationBasisColHeader',
        type : 'number',
        sort : { direction : uiGridConstants.ASC, priority : 0 },
        visible : true,
      },
      {
        field : 'reorder',
        displayName : '',
        cellTemplate: '/modules/cost_center/templates/reorder_allocation_steps.tmpl.html',
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
        auxData.sort((a, b) => Number(a.step_order) - Number(b.step_order));
        auxData.forEach((item, i) => {
          item.row_num = i;
          if (i === 0) {
            item.first_row = true;
          } else if (i === auxData.length - 1) {
            item.last_row = true;
          }
        });
        vm.data = auxData;
        vm.gridOptions.data = vm.data;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function moveStepDown(id, row) {
    const currRow = vm.data[row];
    const nextRow = vm.data[row + 1];
    // Swap
    CostCenters.setAllocationStepOrder({ id : currRow.id, step_order : nextRow.step_order });
    CostCenters.setAllocationStepOrder({ id : nextRow.id, step_order : currRow.step_order });
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
    loadCostCenters();
  }

  function moveStepUp(id, row) {
    const currRow = vm.data[row];
    const prevRow = vm.data[row - 1];
    // Swap
    CostCenters.setAllocationStepOrder({ id : currRow.id, step_order : prevRow.step_order });
    CostCenters.setAllocationStepOrder({ id : prevRow.id, step_order : currRow.step_order });
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
    loadCostCenters();
  }

  loadCostCenters();
}
