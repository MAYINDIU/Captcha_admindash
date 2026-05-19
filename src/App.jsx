import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import './css/style.css';
import './charts/ChartjsConfig';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {  Outlet } from 'react-router-dom';
// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Partnerlist from './pages/PartnerList/Partnerlist';
import Customer from './pages/Customer/Customer';
import Addemployee from './pages/Employee/Addemployee';
import Designation from './pages/Designation/Designation';
import Cardapplication from './pages/Card_Application/Cardapplication';
import Addcustomer from './pages/Customer/Addcustomer';
import Orderlist from './pages/Order/Orderlist';
import Employeelist from './pages/Employee/Employeelist';
import CustomerDetails from './pages/Customer/CustomerDetails';
import Paymentgateway from './pages/PaymentGateway/Paymentgateway';
import PaymentConfirmationPage from './pages/Customer/PaymentConfirmationPage';
import PaymentFailed from './pages/Customer/PaymentFailed';


import Withdrawlistadmin from './pages/Withdraw/Withdrawlistadmin';
import AdminCommissionRation from './pages/CommissionInfo/AdminCommissionRation';
import Payoutlist from './pages/Withdraw/Payoutlist';
import Category from './pages/Category/Category';
import AllProduct from './pages/Product/AllProduct';
import Services from './pages/Services/Services';
import AllBranch from './pages/Branch/AllBranch';
import Agents from './pages/Agent/Agents';
import NewCustomer from './pages/Customer/NewCustomer';
import CommissionRuleslist from './pages/Commission/CommissionRuleslist';
import CommissionList from './pages/Commission/CommissionList';
import Stockmovement from './pages/Stockmovement/Stockmovement';
import CommissionSetting from './pages/Commission/CommissionSetting';
import RankRequirements from './pages/RankRequirements/RankRequirements';
import CreateSale from './pages/Order/CreateSale';
import SaleorderList from './pages/Order/SaleorderList';
import CreateInstallment from './pages/Order/CreateInstallment';
import PaymentInstallment from './pages/Order/PaymentInstallment';
import Installmentlist from './pages/Installment/Installmentlist';
import CustomerOrderlist from './pages/Installment/CustomerOrderlist';
import CustomerPaymentHistory from './pages/Installment/CustomerPaymentHistory';
import CustomerChangepassword from './pages/Installment/CustomerChangepassword';
import SalesReport from './pages/Reports/SalesReport';
import SalesReportPDF from './pages/Reports/SalesReportPDF';
import CommissionReport from './pages/Reports/CommissionReport';
import CommissionReportPdf from './pages/Reports/CommissionReportPdf';
import EmployeePerformanceReport from './pages/Reports/EmployeePerformanceReport';
import EmpPerformancePdf from './pages/Reports/EmpPerformancePdf';
import StockDetailsReport from './pages/Reports/StockDetailsReport';
import StockReportpdf from './pages/Reports/StockReportpdf';
import AgentCreateSale from './pages/Agent/AgentCreateSale';
import AgentSalesList from './pages/Agent/AgentSalesList';
import AgentCreateInstallment from './pages/Agent/AgentCreateInstallment';
import NewCustomerForAgent from './pages/Customer/NewCustomerForAgent';
import PasswordChange from './pages/Employee/PasswordChange';
import Customerlist from './pages/EmployeeDashboard/Customerlist';
import SalesorderLists from './pages/EmployeeDashboard/SalesorderLists';
import Fullpayment from './pages/Order/Fullpayment';
import EmployeeCommissionlist from './pages/CommissionInfo/EmployeeCommissionlist';
import Supplier from './pages/SupplierList/Supplier';
import SupplierPayable from './pages/SupplierList/SupplierPayable';
import Month_IncentiveList from './pages/MonthlyIncentive/Month_IncentiveList';
import PaymentList from './pages/PaymentGateway/PaymentList';
import Directorfundlist from './pages/DirectorFund/Directorfundlist';
import ServiceSale from './pages/ServiceSaleAdmin/ServiceSale';
import CreateServiceSale from './pages/ServiceSaleAdmin/CreateServiceSale';
import ServicePayment from './pages/ServiceSaleAdmin/ServicePayment';
import ServiceCommissionlist from './pages/ServiceSaleAdmin/ServiceCommissionlist';
import CharofAccounts from './pages/Accounts/CharofAccounts';
import TrialBalanceReport from './pages/Accounts/TrialBalanceReport';
import Journallist from './pages/Accounts/Journallist';
import ProfitLostReport from './pages/Accounts/ProfitLostReport';
import BalanceSheetReport from './pages/Accounts/balancesheet';
import LedgerReport from './pages/Accounts/leadgerreport';
import PDlist from './pages/PDspecialbonus/PDlist';
import AgentCommissionList from './pages/Agent/AgentCommissionList';
import WithdrawEmployee from './pages/Withdrawal/WithdrawEmployee';
import WithdrawlistAdmins from './pages/Withdrawal/WithdrawlistAdmins';
import WithdrawAgentList from './pages/Withdrawal/WithdrawAgentList';
import EmployeeAddRequest from './pages/Employee/EmployeeAddRequest';
import EmployeeAddreqListadmin from './pages/Employee/EmployeeAddreqListadmin';
import AddWorkEmp from './pages/WorkSummary/AddWorkEmp';
import WorkListAdmin from './pages/WorkSummary/WorkListAdmin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommissionProcessHistory from './pages/Reports/CommissionProcessHistorys';
import MyTeamList from './pages/Employee/MyTeamList';
import Adminteamlist from './pages/Employee/Adminteamlist';
import Agent_installment_Payment from './pages/Order/Agent_installment_Payment';
import AgentSalesSummary from './pages/Agent/AgentSalesSummary';
import AdminAnnouncementlist from './pages/Announcement/AdminAnnouncementlist';
import NoticeListEmployee from './pages/Announcement/NoticeListEmployee';
import AgentPaymentSettelement from './pages/AgentPayment/AgentPaymentSettelement';
import AdminSettelementlist from './pages/AgentPayment/AdminSettelementlist';
import EmployeeMonthIncentivelist from './pages/MonthlyIncentive/EmployeeMonthIncentivelist';



import FastWorkHome from './pages/FastWorkHome';
import P_details from './pages/Website/Products/P_details';
import ContactUsPage from './pages/Website/ContactUsPage';
import AboutUsPage from './pages/Website/AboutUsPage';
import ServicesPage from './pages/Website/Services';
import ProjectFeaturesAndValues from './pages/Website/Features/ProjectFeaturesAndValues';
import BoardOfDirectors from './pages/Website/Features/BoardOfDirectors';
import ProjectAmenities from './pages/Website/Features/ProjectAmenities';
import TermsAndConditions from './pages/Website/Features/Termsconditions';
import MyInformation from './pages/Website/Features/MyInformation';
import OurProducts from './pages/Website/Features/OurProducts';
import Vission from './pages/Website/Vission';



import Navbar from './pages/Website/Navbar/Navbar';
import Footer from './pages/Website/Footer/Footer';
import AdminPromotionList from './pages/Promotion/AdminPromotionList';
import AdminCalculateprmotion from './pages/Promotion/AdminCalculateprmotion';
import PromotionListEmployee from './pages/Promotion/PromotionListEmployee';
import EmployeeRequestlist from './pages/Employee/EmployeeRequestlist';
import ProjectLocationMap from './pages/Website/Features/ProjectLocationMap';
import ProjectLayout from './pages/Website/Features/ProjectLayout';
import Promotionacheivementemployee from './pages/Promotion/Promotionacheivementemployee';
import PromotionRewardTransactionEmp from './pages/Promotion/PromotionRewardTransactionEmp';
import MonthlyIncentiveReport from './pages/Reports/MonthlyIncentiveReport';
import MonthlyIncentiverPdf from './pages/Reports/MonthlyIncentiverPdf';
import EmployeeWalletstatement from './pages/EmployeeDashboard/EmployeeWalletstatement';
import AgentWalletStatement from './pages/Agent/AgentWalletStatement';
import CommissionProcessHistorys from './pages/Reports/CommissionProcessHistorys';
import UploadPhoto from './pages/Galary/UploadPhoto';
import BlogsDataUpload from './pages/Galary/BlogsDataUpload';
import NewsEvents from './pages/Website/Features/NewsEvents';
import RiverparkGalary from './pages/Website/Features/RiverparkGalary';
import AgentCustomerPayment from './pages/Agent/AgentCustomerPayment';
import Alluser from './pages/UserList/Alluser';
import WithdrawallistTrn from './pages/UserList/WithdrawallistTrn';
import Chat from './pages/UserList/Chat';
import Captchatask from './pages/UserList/Captchatask';
import VerifiactionList from './pages/UserList/VerifiactionList';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents refetching data every time you click away and back
      retry: 1,
    },
  },
});


// ==========================================
// Layout Components
// ==========================================
const WebsiteLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-emerald-50 text-emerald-950">
      <Navbar/>
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-emerald-50 overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};



function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
    <QueryClientProvider client={queryClient}>
    <Routes >

     <Route exact path="/" element={<FastWorkHome />} />
     <Route exact path="/web" element={<FastWorkHome />} />
     <Route exact path="/admin-login" element={<Login />} />

          {/* PUBLIC WEBSITE ROUTES */}
        <Route element={<WebsiteLayout />}>
        <Route path='/Product_details' element={<P_details />}>P_details</Route>
        <Route path='/contact-us' element={<ContactUsPage />}>ContactUsPage</Route>
        <Route path='/about-us' element={<AboutUsPage />}>AboutUsPage</Route>
        <Route path='/vission' element={<Vission />}>Vission</Route>
         <Route path='/riverpark-galary' element={<RiverparkGalary />}>RiverparkGalary</Route>
        <Route path='/project-location-map' element={<ProjectLocationMap />}>Master Layout</Route>
        <Route path='/project-layout' element={<ProjectLayout />}>Master Layout</Route>
        <Route path='/services' element={<ServicesPage />}>Services</Route>
        <Route path='/company-values' element={<ProjectFeaturesAndValues />}>Company Values</Route>
        <Route path='/board-of-directors' element={<BoardOfDirectors />}>Company Values</Route> 
        <Route path='/news-events' element={<NewsEvents />}>Company Values</Route> 
        <Route path='/project-amenities' element={<ProjectAmenities />}>Company Values</Route>  
        <Route path='/terms-conditions' element={<TermsAndConditions />}>Company Values</Route>  
        <Route path='/my-information' element={<MyInformation />}>My Information</Route>  
 
       <Route path='/our-products' element={<OurProducts />}>My Products</Route>  
        </Route>

     <Route element={<DashboardLayout />}>

     <Route exact path="/dashboard" element={<Dashboard />} />
     <Route  exact path="/all-products" element={<AllProduct />} />
     <Route  exact path="/all-services" element={<Services />} />
     <Route  exact path="/all-branch" element={<AllBranch />} />
     <Route  exact path="/all-supplier" element={<Supplier />} />
     <Route  exact path="/all-agents" element={<Agents />} />
     <Route  exact path="/supplier-payable" element={<SupplierPayable />} />
     <Route  exact path="/add-work-summary" element={<AddWorkEmp />} />
     <Route  exact path="/work-list-admin" element={<WorkListAdmin />} />
     <Route  exact path="/my-team-list" element={<MyTeamList />} />
     <Route  exact path="/team-list" element={<Adminteamlist />} />
     <Route  exact path="/all-category" element={<Category />} />
     <Route  exact path="/partner-list" element={<Partnerlist />} />
     <Route  exact path="/customer-list" element={<Customer />} />
     <Route  exact path="/add-new-customer" element={<NewCustomer />} />
     <Route  exact path="/add-employee" element={<Addemployee />} />
     <Route  exact path="/add-designation" element={<Designation />} />
     <Route  exact path="/for-card-application" element={<Cardapplication />} />
     <Route  exact path="/card-application" element={<Addcustomer />} />
     <Route  exact path="/order-list" element={<Orderlist />} />
     <Route  exact path="/admin-promotion-list" element={<AdminPromotionList />} />
     <Route  exact path="/calculate-promotion" element={<AdminCalculateprmotion />} />
     <Route  exact path="/promotion-list-employee" element={<PromotionListEmployee />} />

       <Route  exact path="/all-users" element={<Alluser/>} />
       <Route  exact path="/withdrawal-list-trn-list" element={<WithdrawallistTrn/>} />
       <Route  exact path="/chat" element={<Chat/>} />
       <Route  exact path="/captchatask" element={<Captchatask/>} />
       <Route  exact path="/verification-list" element={<VerifiactionList/>} />
        
     

     <Route  exact path="/employee-request-list" element={<EmployeeRequestlist />} />
     <Route  exact path="/promotion-acheivement" element={<Promotionacheivementemployee />} />

     <Route  exact path="/promotion-reward-transaction" element={<PromotionRewardTransactionEmp />} />
    <Route  exact path="/upload-photo" element={<UploadPhoto />} />
     <Route  exact path="/blog-upload" element={<BlogsDataUpload />} />


 <Route  exact path="/agent-customer-payment" element={<AgentCustomerPayment />} />
     
      
     
     


     

    <Route  exact path="/agent-sales-summary" element={<AgentSalesSummary />} />

    <Route  exact path="/all-sale-list" element={<SaleorderList />} />
    <Route  exact path="/create-sales" element={<CreateSale />} />
   <Route  exact path="/create-customer-agent" element={<NewCustomerForAgent />} />

    <Route  exact path="/withdrawal-req-employee" element={<WithdrawEmployee />} />
    <Route  exact path="/withdrawal-req-admin" element={<WithdrawlistAdmins />} />
    <Route  exact path="/withdrawal-req-agent" element={<WithdrawAgentList />} />

    <Route  exact path="/employee-add-request" element={<EmployeeAddRequest />} />
    <Route  exact path="/employee-request-list-admin" element={<EmployeeAddreqListadmin />} />

 <Route  exact path="/agent-payment-settlement" element={<AgentPaymentSettelement />} />

 <Route  exact path="/admin-payment-settlement" element={<AdminSettelementlist />} />
 <Route  exact path="/employee-month-incentive-list" element={<EmployeeMonthIncentivelist />} />

   {/* Admin service sale */}
       <Route  exact path="/admin-service-sale" element={<ServiceSale />} />
       <Route  exact path="/create-service-sale" element={<CreateServiceSale />} />
       <Route  exact path="/service-commission-list" element={<ServiceCommissionlist />} />
  {/* Admin service sale */}

     <Route  exact path="/pd-bonus-list" element={<PDlist />} />

   {/* Accounts Module */}
  <Route  exact path="/chartof-accounts" element={<CharofAccounts />} />
  <Route  exact path="/trial-balance-report" element={<TrialBalanceReport />} />
  <Route  exact path="/journal-list" element={<Journallist />} />
  <Route  exact path="/profit-loss-report" element={<ProfitLostReport />} />
  <Route  exact path="/balance-sheet-report" element={<BalanceSheetReport />} />
  <Route  exact path="/ledger-report" element={<LedgerReport />} />


    <Route  exact path="/agent-create-sales" element={<AgentCreateSale />} />
    <Route  exact path="/agent-sale-list" element={<AgentSalesList />} />
    <Route  exact path="/agent-create-installment" element={<AgentCreateInstallment />} />
    <Route  exact path="/agent-commission-list" element={<AgentCommissionList />} />


    <Route  exact path="/create-installment" element={<CreateInstallment />} />
    <Route  exact path="/payment-installment" element={<PaymentInstallment />} />
    <Route  exact path="/agent-payment-installment" element={<Agent_installment_Payment />} />
    
   <Route  exact path="/service-payment" element={<ServicePayment />} />

   <Route  exact path="/admin-announcement-list" element={<AdminAnnouncementlist />} />
   <Route  exact path="/employee-announcement-list" element={<NoticeListEmployee />} />
   


    
    <Route  exact path="/installment-list" element={<Installmentlist />} />
    <Route  exact path="/customer-order-list" element={<CustomerOrderlist />} />
    <Route  exact path="/customer-payment-history" element={<CustomerPaymentHistory />} />
    <Route  exact path="/change-password" element={<CustomerChangepassword />} />
    <Route  exact path="/password-change" element={<PasswordChange />} />
    <Route  exact path="/full-payment" element={<Fullpayment />} />

    {/* Report section routes */}-
    <Route  exact path="/sales-report" element={<SalesReport />} />
    <Route path="/sales-report-pdf" element={<SalesReportPDF />} />
    <Route path="/commission-report" element={<CommissionReport />} />
    <Route path="/commission-report-pdf" element={<CommissionReportPdf />} />


    <Route path="/employee-performance-report" element={<EmployeePerformanceReport />} />
    <Route path="/employee-performance-report-pdf" element={<EmpPerformancePdf />} />
    <Route path="/commission-process-history" element={<CommissionProcessHistorys />} />


    <Route path="/monthly-incentive-report" element={<MonthlyIncentiveReport />} />
    <Route path="/monthly-incentive-pdf" element={<MonthlyIncentiverPdf />} />


    <Route path="/employee-wallet-statement" element={<EmployeeWalletstatement />} />
        <Route path="/agent-wallet-statement" element={<AgentWalletStatement />} />



     <Route path="/stock-detail-report" element={<StockDetailsReport/>} />
    <Route path="/stock-report-pdf" element={<StockReportpdf/>} />

    {/* Report section routes */}

    {/* Employee Dashboard */}
   
    <Route  exact path="/customer-list-emp" element={<Customerlist />} />
    <Route  exact path="/my-sales-list" element={<SalesorderLists />} />
    <Route  exact path="/monthly-incentive-list" element={<Month_IncentiveList />} />
    <Route  exact path="/payment-list" element={<PaymentList />} />
    <Route  exact path="/directorfund-list" element={<Directorfundlist />} />

    {/* Employee Dashboard */}





     <Route  exact path="/commission-rules-list" element={<CommissionRuleslist />} />
     <Route  exact path="/commission-list" element={<CommissionList />} />
     <Route  exact path="/commission-setting" element={<CommissionSetting />} />
     <Route  exact path="/commission-setting" element={<CommissionProcessHistory />} />
     

     <Route  exact path="/employee-list" element={<Employeelist />} />
     <Route  exact path="/stockmovement-list" element={<Stockmovement />} />
     <Route  exact path="/rank-requirements" element={<RankRequirements />} />


     <Route path="/customers/:id" element={<CustomerDetails />} />
     <Route path="/payment-gateway" element={<Paymentgateway />} />
     <Route path="/payment-success" element={<PaymentConfirmationPage />} />
     <Route path="/payment-fail" element={<PaymentFailed />} />
     <Route path="/withdraw-list" element={<Withdrawlistadmin />} />
     <Route path="/commission-ratio" element={<AdminCommissionRation />} />
     <Route path="/payout-list" element={<Payoutlist />} />


     <Route path="/commission-list-employyee" element={<EmployeeCommissionlist />} />
     
     </Route>


   



      </Routes>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </>
  );
}

export default App;
