/* Rootflow V4 — bilingual decision-dashboard copy. Extends the existing V3 dictionary. */
(function (global) {
  'use strict';
  var I = global.RootflowI18n;
  if (!I || !I.dictionary) return;

  Object.assign(I.dictionary.vi, {
    navOverview:'Tổng quan', navCashflow:'Dòng tiền', navAssets:'Tài sản', navPlan:'Kế hoạch',
    assetsAndCapital:'Tài sản & nguồn vốn', totalAssetsLabel:'Tổng tài sản', ownCapitalLabel:'Vốn ròng của bạn', debtCapitalLabel:'Vay nợ', debtToAssets:'Nợ / tài sản',
    cashLabel:'Tiền khả dụng', receivablesLabel:'Đang cho vay', investmentsLabel:'Đầu tư', ownedAssetsLabel:'Tài sản sở hữu',
    debtAndLiquidity:'Nợ & thanh khoản', shortDebt:'Nợ ngắn hạn', longDebt:'Nợ dài hạn', unknownDebt:'Chưa rõ kỳ hạn', obligations30:'Nghĩa vụ 30 ngày', nextDue:'Kỳ gần nhất',
    bufferStatus:'Trạng thái buffer', currentCash:'Cash hiện có', reliableCash:'Tiền chắc chắn về', afterDebt:'Sau nghĩa vụ 30 ngày', requiredBuffer:'Buffer cần giữ',
    debtCovered:'Đủ trả nghĩa vụ đã biết', thinBuffer:'Trả được nợ nhưng buffer mỏng', cashShortfall:'Thiếu tiền theo kế hoạch', needMore:'Cần bổ sung',
    businessHealth:'Hoạt động kinh doanh', lendingIncomeMonthly:'Lãi cho vay / tháng', fundingCostMonthly:'Chi phí vốn / tháng', businessProfitMonthly:'Lợi nhuận lõi / tháng',
    next30BusinessMargin:'Biên tiền kinh doanh 30 ngày', profitableHealthy:'Có lãi · dòng tiền ổn', profitableCashTight:'Có lãi · nhưng dòng tiền căng', lossBusiness:'Hoạt động đang âm', estimateOnly:'Ước tính theo chi phí vốn đã biết',
    spendingAndInvesting:'Chi tiêu & đầu tư', spendingPlan:'Kế hoạch chi tiêu', monthlyBudget:'Ngân sách tháng', spent:'Đã chi', remaining:'Còn lại', noBudget:'Chưa lập kế hoạch', overBudget:'Vượt ngân sách', onTrack:'Trong kế hoạch',
    investmentPosition:'Vị thế đầu tư', financialInvestments:'Đầu tư tài chính', ownedAssets:'Tài sản sở hữu', noInvestments:'Chưa ghi nhận khoản đầu tư', deployableAfterBuffer:'Dư sau buffer',
    details:'Chi tiết', advancedDetails:'Chi tiết nâng cao', hideAdvanced:'Ẩn chi tiết', cashflowAndDebt:'Dòng tiền & lịch trả nợ', assetPosition:'Cấu trúc tài sản', debtStructure:'Cấu trúc nợ',
    fundingAndLending:'Nguồn vốn & cho vay', planningOverview:'Kế hoạch cá nhân', simulateDecision:'Mô phỏng quyết định', noData:'Chưa có dữ liệu', percentageOfAssets:'tài sản',
    dueUnknown:'Chưa rõ ngày', coreProfitCaveat:'Lợi nhuận lõi tách lương cá nhân khỏi hoạt động cho vay.', liquidityCaveat:'Đánh giá buffer dùng dòng tiền chắc chắn; tiền dự kiến không được dùng để chứng minh an toàn.'
  });

  Object.assign(I.dictionary.en, {
    navOverview:'Overview', navCashflow:'Cashflow', navAssets:'Assets', navPlan:'Plan',
    assetsAndCapital:'Assets & funding', totalAssetsLabel:'Total assets', ownCapitalLabel:'Net own capital', debtCapitalLabel:'Debt funding', debtToAssets:'Debt / assets',
    cashLabel:'Available cash', receivablesLabel:'Lending receivables', investmentsLabel:'Investments', ownedAssetsLabel:'Owned assets',
    debtAndLiquidity:'Debt & liquidity', shortDebt:'Short-term debt', longDebt:'Long-term debt', unknownDebt:'Unknown maturity', obligations30:'30-day obligations', nextDue:'Next due',
    bufferStatus:'Buffer status', currentCash:'Current cash', reliableCash:'Committed inflows', afterDebt:'After 30-day obligations', requiredBuffer:'Cash buffer to keep',
    debtCovered:'Known obligations are covered', thinBuffer:'Debt is covered but buffer is thin', cashShortfall:'Cash shortfall in the plan', needMore:'Additional cash needed',
    businessHealth:'Business health', lendingIncomeMonthly:'Lending income / month', fundingCostMonthly:'Funding cost / month', businessProfitMonthly:'Core profit / month',
    next30BusinessMargin:'30-day business cash margin', profitableHealthy:'Profitable · cashflow healthy', profitableCashTight:'Profitable · cashflow tight', lossBusiness:'Business is loss-making', estimateOnly:'Estimate based on known funding costs',
    spendingAndInvesting:'Spending & investing', spendingPlan:'Spending plan', monthlyBudget:'Monthly budget', spent:'Spent', remaining:'Remaining', noBudget:'No spending plan yet', overBudget:'Over budget', onTrack:'On track',
    investmentPosition:'Investment position', financialInvestments:'Financial investments', ownedAssets:'Owned assets', noInvestments:'No investments recorded', deployableAfterBuffer:'Surplus after buffer',
    details:'Details', advancedDetails:'Advanced details', hideAdvanced:'Hide details', cashflowAndDebt:'Cashflow & debt schedule', assetPosition:'Asset structure', debtStructure:'Debt structure',
    fundingAndLending:'Funding & lending', planningOverview:'Personal plan', simulateDecision:'Decision simulator', noData:'No data', percentageOfAssets:'of assets',
    dueUnknown:'Date unknown', coreProfitCaveat:'Core profit excludes salary and isolates the lending activity.', liquidityCaveat:'Buffer uses committed cash only; Expected inflows are not used to prove safety.'
  });
})(window);
