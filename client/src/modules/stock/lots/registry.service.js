angular.module('bhima.services')
  .service('LotsRegistryService', LotsRegistryService);

LotsRegistryService.$inject = [
  'uiGridConstants', 'SessionService',
];

/**
 * This service encapsulate some common method of stock lots registry with the aims
 * of reducing lines in registry.js
 */
function LotsRegistryService(uiGridConstants, Session) {
  const service = this;

  service.groupingBox = [
    { label : 'STOCK.INVENTORY', value : 'text' },
    { label : 'STOCK.INVENTORY_GROUP', value : 'group_name' },
  ];

  service.columnDefs = [
    {
      field : 'depot_text',
      displayName : 'STOCK.DEPOT',
      headerTooltip : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    }, {
      field : 'code',
      displayName : 'STOCK.CODE',
      headerTooltip : 'STOCK.CODE',
      headerCellFilter : 'translate',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 0,
      },
    }, {
      field : 'text',
      displayName : 'STOCK.INVENTORY',
      headerTooltip : 'STOCK.INVENTORY',
      headerCellFilter : 'translate',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 1,
      },
    }, {
      field : 'group_name',
      displayName : 'TABLE.COLUMNS.INVENTORY_GROUP',
      headerTooltip : 'TABLE.COLUMNS.INVENTORY_GROUP',
      headerCellFilter : 'translate',
    }, {
      field : 'label',
      displayName : 'STOCK.LOT',
      headerTooltip : 'STOCK.LOT',
      headerCellFilter : 'translate',
    }, {
      field : 'quantity',
      displayName : 'STOCK.QUANTITY',
      headerTooltip : 'STOCK.QUANTITY',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
    }, {
      field : 'unit_cost',
      displayName : 'STOCK.UNIT_COST',
      headerTooltip : 'STOCK.UNIT_COST',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
      cellFilter : 'currency: '.concat(Session.enterprise.currency_id),
    }, {
      field : 'unit_type',
      width : 75,
      displayName : 'TABLE.COLUMNS.UNIT',
      headerTooltip : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventories/templates/unit.tmpl.html',
    }, {
      field : 'entry_date',
      displayName : 'STOCK.ENTRY_DATE',
      headerTooltip : 'STOCK.ENTRY_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    }, {
      field : 'expiration_date',
      displayName : 'STOCK.EXPIRATION_DATE',
      headerTooltip : 'STOCK.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    }, {
      field : 'delay_expiration',
      displayName : 'STOCK.EXPIRATION',
      headerTooltip : 'STOCK.EXPIRATION',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
    }, {
      field : 'avg_consumption',
      displayName : 'STOCK.CMM',
      headerTooltip : 'STOCK.CMM',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
    }, {
      field : 'S_MONTH',
      displayName : 'STOCK.MSD',
      headerTooltip : 'STOCK.MSD',
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      type : 'number',
    }, {
      field : 'lifetime',
      displayName : 'STOCK.LIFETIME',
      headerTooltip : 'STOCK.LIFETIME',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      cellTemplate     : 'modules/stock/lots/templates/lifetime.cell.html',
      type : 'number',
      sort : {
        direction : uiGridConstants.ASC,
        priority : 2,
      },
    }, {
      field : 'S_LOT_LIFETIME',
      displayName : 'STOCK.LOT_LIFETIME',
      headerTooltip : 'STOCK.LOT_LIFETIME',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/lot_lifetime.cell.html',
      cellClass : 'text-right',
      type : 'number',
    }, {
      field : 'S_RISK',
      displayName : 'STOCK.RISK',
      headerTooltip : 'STOCK.RISK',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/risk.cell.html',
      cellClass : 'text-right',
      type : 'number',
      sort : {
        direction : uiGridConstants.DESC,
        priority : 3,
      },
    },
    {
      field : 'S_RISK_QUANTITY',
      displayName : 'STOCK.RISK_QUANTITY',
      headerTooltip : 'STOCK.RISK_QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/risk_quantity.cell.html',
      type : 'number',
    },
    {
      field : 'tagNames',
      displayName : 'TAG.LABEL',
      headerTooltip : 'TAG.LABEL',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/lots/templates/tags.cell.html',
    }, {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/stock/lots/templates/action.cell.html',
    }];

  service.gridFooterTemplate = `
    <div class="ui-grid-cell-contents">
      <b>{{ grid.appScope.countGridRows() }}</b>
      <span translate>TABLE.AGGREGATES.ROWS</span>

      <span class="fa fa-circle icon-expired legend"></span>
      <strong>
        <span translate>STOCK.EXPIRED</span>: {{grid.appScope.totals.expired}}
      </strong>

      <span class="fa fa-circle icon-at-risk-of-expiring legend"></span>
      <strong>
        <span translate>STOCK.RISK_OF_EXPIRATION</span>: {{grid.appScope.totals['at-risk-of-expiring']}}
      </strong>

      <span class="fa fa-circle icon-at-risk legend"></span>
      <strong>
        <span translate>STOCK.RISK_OF_STOCK_OUT</span>: {{grid.appScope.totals['at-risk']}}
      </strong>

      <span class="fa fa-circle icon-out-of-stock legend"></span>
      <strong>
        <span translate>STOCK.STATUS.STOCK_OUT</span>: {{grid.appScope.totals['out-of-stock']}}
      </strong>

    </div>
  `;

  /**
   * @function formatLotsWithoutExpirationDate
   *
   * @description
   * Removes values from lots that do not have expiration dates so they do not show up in the
   * registry view.
   */
  service.formatLotsWithoutExpirationDate = (lot) => {
    lot.hasExpirationDate = (lot.tracking_expiration === 1);
    if (!lot.hasExpirationDate) {
      delete lot.delay_expiration;
      delete lot.expiration_date;
      delete lot.lifetime;
      delete lot.S_LOT_LIFETIME;
    }
  };

  service.orderByDepot = (rowA, rowB) => {
    return String(rowA.depot_text).localeCompare(rowB.depot_text);
  };
}
