const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const Exchange = require('../../exchange');

const TEMPLATE = './server/controllers/finance/reports/cost_center/report.handlebars';
const AccountReference = require('../../accounts').references;
const setting = require('./setting');
const getDistributionKey = require('../../allocationCostCenter/getDistributionKey');
// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'cost_center_report',
  filename : 'TREE.COST_CENTER_REPORT',
  orientation : 'portrait',
};

/**
 * @function report
 *
 * @description
 * This function renders the balance of accounts references as report.  The account_reference report provides a view
 * of the balance of account_references for a given period of fiscal year.
 */
async function report(req, res, next) {
  const params = req.query;
  const exchange = await Exchange.getExchangeRate(req.session.enterprise.id, params.currency_id, new Date());
  const data = {
    currencyId : Number(params.currency_id),
    exchangeRate : exchange.rate || 1,
  };
  const display = {};
  let reporting;

  params.start_date = new Date(params.start_date);
  params.end_date = new Date(params.end_date);

  data.period = {
    start_date : params.start_date,
    end_date : params.end_date,
    fiscalYearStart : params.fiscalYearStart,
  };

  if (params.costCenterOperations === '1') {
    display.costCenterOperations = params.costCenterOperations;
  }

  if (params.profitCenterOperations === '1') {
    display.profitCenterOperations = params.profitCenterOperations;
  }

  if (params.distributionCost === '1') {
    display.distributionCost = params.distributionCost;
  }

  if (params.distributionProfit === '1') {
    display.distributionProfit = params.distributionProfit;
  }

  if (params.analysisPrincipal === '1') {
    display.analysisPrincipal = params.analysisPrincipal;
  }

  data.display = display;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  const getCostCenter = `
    SELECT fc.id, fc.label, fc.is_principal FROM cost_center AS fc ORDER BY fc.label ASC, fc.is_principal DESC
  `;

  const getCostCenterReference = `
    SELECT fc.id, fc.label, fc.is_principal, rf.cost_center_id, rf.account_reference_id,
    rf.is_cost, rf.is_variable, rf.is_turnover, ar.abbr
    FROM cost_center AS fc
    JOIN reference_cost_center AS rf ON rf.cost_center_id = fc.id
    JOIN account_reference AS ar ON ar.id = rf.account_reference_id
    ORDER BY fc.label
  `;

  const getCostCenterDistribution = `
    SELECT fcd.is_cost, BUID(fcd.row_uuid) AS row_uuid, fca.label AS auxiliary, fcp.label AS principal,
    SUM(fcd.debit_equiv) AS debit, SUM(fcd.credit_equiv) AS credit, gl.trans_date, fcd.auxiliary_cost_center_id,
    fcd.principal_cost_center_id
    FROM cost_center_allocation AS fcd
    JOIN general_ledger AS gl ON gl.uuid = fcd.row_uuid
    JOIN cost_center AS fcp ON fcp.id = fcd.principal_cost_center_id
    JOIN cost_center AS fca ON fca.id = fcd.auxiliary_cost_center_id
    WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?)
    GROUP BY fcd.principal_cost_center_id, fcd.auxiliary_cost_center_id;
  `;

  const dbPromises = [
    db.exec(getCostCenter),
    db.exec(getCostCenterReference),
    AccountReference.computeAllAccountReference(params.period_id),
    db.exec(getCostCenterDistribution, [params.fiscalYearStart, params.end_date]),
    getDistributionKey.allDistributionKey(),
  ];

  Promise.all(dbPromises)
    .then(([costCenter, references, accountReferences, dataDistributions, allocationKey]) => {
      const config = {
        costCenter,
        references,
        accountReferences,
        dataDistributions,
        allocationKey,
        includeManual : params.includeManual,
      };
      const dataConfigured = setting.configuration(config);

      _.merge(data, dataConfigured);

      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
