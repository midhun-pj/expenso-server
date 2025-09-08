import logger from '../utils/logger.js';
import GroceryItemModel from '../models/GroceryItem.js';
import UserModel from '../models/User.js';
import BudgetModel from '../models/Budget.js';
import ExpenseModel from '../models/Expense.js';

class DashboardController {
  // Get dashboard overview
  static async getDashboardOverview(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const startDate = currentMonth.toISOString().split('T')[0];
      const endDate = nextMonth.toISOString().split('T')[0];

      // Get current month expenses
      const currentMonthExpenses = await ExpenseModel.getByUserId(user.id, {
        start_date: startDate,
        end_date: endDate,
        limit: 1000
      });

      // Calculate totals
      const totalExpenses = currentMonthExpenses.expenses.reduce((sum, exp) => sum + parseFloat(exp.total_amount), 0);
      const totalTransactions = currentMonthExpenses.expenses.length;

      // Get expense by category
      const expensesByCategory = await ExpenseModel.getSummaryByCategory(user.id, startDate, endDate);

      // Get monthly trends (last 6 months)
      const monthlyTrends = await ExpenseModel.getMonthlyTrends(user.id, 6);

      // Get active budgets with progress
      const budgetProgress = await BudgetModel.getBudgetProgress(user.id);

      // Get grocery spending by category
      const grocerySpending = await GroceryItemModel.getSpendingByCategory(user.id, startDate, endDate);

      // Calculate budget status
      const totalBudget = budgetProgress.reduce((sum, budget) => sum + parseFloat(budget.budget_amount), 0);
      const budgetUsed = budgetProgress.reduce((sum, budget) => sum + parseFloat(budget.spent_amount), 0);
      const budgetRemaining = totalBudget - budgetUsed;

      res.json({
        success: true,
        data: {
          overview: {
            current_month: {
              total_expenses: totalExpenses,
              total_transactions: totalTransactions,
              period: { start_date: startDate, end_date: endDate }
            },
            budget: {
              total_budget: totalBudget,
              used_amount: budgetUsed,
              remaining_amount: budgetRemaining,
              percentage_used: totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0
            }
          },
          charts: {
            expenses_by_category: expensesByCategory,
            monthly_trends: monthlyTrends,
            grocery_spending: grocerySpending
          },
          budgets: budgetProgress
        }
      });
    } catch (error) {
      logger.error('Error getting dashboard overview:', error);
      next(error);
    }
  }

  // Get expense analytics
  static async getExpenseAnalytics(req, res, next) {
    try {
      const user = await UserModel.getByAuthId(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const months = parseInt(req.query.months) || 12;

      // Get monthly trends
      const monthlyTrends = await ExpenseModel.getMonthlyTrends(user.id, months);

      // Get expense by category for the period
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      const expensesByCategory = await ExpenseModel.getSummaryByCategory(
        user.id, 
        startDate.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      res.json({
        success: true,
        data: {
          monthly_trends: monthlyTrends,
          expenses_by_category: expensesByCategory,
          period_months: months
        }
      });
    } catch (error) {
      logger.error('Error getting expense analytics:', error);
      next(error);
    }
  }
}

export default DashboardController;
