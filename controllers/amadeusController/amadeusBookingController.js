const responseMessage = require("../../utilities/responses");
const statusCode = require("../../utilities/responceCode");
const status = require("../../enums/status");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");
const userType = require("../../enums/userType");
const sendSMSUtils = require("../../utilities/sendSms");
const commonFunction = require("../../utilities/commonFunctions");
const whatsApi = require("../../utilities/whatsApi");
const AdminNumber = process.env.ADMINNUMBER;
const {airlineData} = require("../../model/city.model");
const bookingStatus = require("../../enums/bookingStatus");
/**********************************SERVICES********************************** */
const { userServices } = require("../../services/userServices");
const {
  createUser,
  findUser,
  getUser,
  findUserData,
  updateUser,
  deleteUser,
  paginateUserSearch,
  countTotalUser,
} = userServices;
const {
  transactionModelServices,
} = require("../../services/btocServices/transactionServices");
const {
  createUsertransaction,
  findUsertransaction,
  getUsertransaction,
  deleteUsertransaction,
  userUsertransactionList,
  updateUsertransaction,
  paginateUsertransaction,
  countTotalUsertransaction,
} = transactionModelServices;
const {
  userflightBookingServices,
} = require("../../services/btocServices/flightBookingServices");
const { aggregatePaginate } = require("../../model/role.model");
const {
  createUserflightBooking,
  findUserflightBooking,
  getUserflightBooking,
  findUserflightBookingData,
  deleteUserflightBooking,
  userflightBookingList,
  updateUserflightBooking,
  paginateUserflightBookingSearch,
  aggregatePaginateGetBooking,
} = userflightBookingServices;
const {
  userAmadeusFlightBookingServices,
} = require("../../services/amadeusServices/amadeusFlighBookingServices");
const {
  createUserAmadeusFlightBooking,
  findUserAmadeusFlightBooking,
  getUserAmadeusFlightBooking,
  findUserAmadeusFlightBookingData,
  deleteUserAmadeusFlightBooking,
  listUserAmadeusFlightBookings,
  updateUserAmadeusFlightBooking,
  paginateUserAmadeusFlightBookingSearch,
  countTotalUserAmadeusFlightBookings,
  aggregatePaginateGetUserAmadeusFlightBooking,
  aggregatePaginateGetUserAmadeusFlightBooking1,
  aggrPagGetUserAmadeusFlightBooking,
} = userAmadeusFlightBookingServices;
//**********************************************************API's**********************************************/
exports.amdsFlightBooking = async (req, res, next) => {
  try {
    const data = { ...req.body };
    let options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const isUserExist = await findUser({
      _id: req.userId,
      status: status.ACTIVE,
    });
    if (!isUserExist) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.USERS_NOT_FOUND,
      });
    }
    data.userId = isUserExist._id;
    let formattedDate = new Date().toLocaleDateString("en-GB", options);
    const result = await createUserAmadeusFlightBooking(data);
    const adminContact=[process.env.ADMINNUMBER1,process.env.ADMINNUMBER2,process.env.ADMINNUMBER,process.env.ADMINNUMBER3,process.env.ADMINNUMBER4];
    // console.log("adminContact==========",adminContact)
    if(result.bookingStatus==bookingStatus.FAILED){
      const TemplateNames=['Amadeus Flight',String(data.pnr),String(isUserExist.username),String(formattedDate)];
      await whatsApi.sendWhtsAppAISensyMultiUSer(adminContact,TemplateNames,'adminBookingFailure');
      return res.status(statusCode.OK).send({
        statusCode: statusCode.ReqTimeOut, 
        responseMessage: responseMessage.BOOKING_FAILED,
      });

    }else{
      let tenPercentOfTotal = data.totalAmount * 0.01;
      const walletObj = {
        amount: parseInt(tenPercentOfTotal),
        details: `Flight booking reward`,
        transactionType: "credit",
        createdAt: Date.now(),
      };
     await updateUser(
        { _id: isUserExist._id },
        {
          $inc: { balance: parseInt(tenPercentOfTotal)},
          $push: { walletHistory: walletObj },
        }
      );
      const TemplateNames=["Amadeus Flight",String(data.pnr),String(isUserExist.username),String(formattedDate)];
      await whatsApi.sendWhtsAppAISensyMultiUSer(adminContact,TemplateNames,'admin_booking_Alert');
      const phone = '+91'+data?.passengerDetails[0]?.ContactNo;
      const depDate=new Date(data.airlineDetails[0].Origin.DepTime);
      const depTime=new Date(data.airlineDetails[0].Origin.DepTime);
      const arrTime=new Date(data.airlineDetails[0].Destination.ArrTime);
      const userName = `${data?.passengerDetails[0]?.firstName} ${data?.passengerDetails[0]?.lastName}`;
       const airlineDetails=await airlineData.find({airlineCode:data.airlineDetails[0].Airline.AirlineCode});
     const airLineName = data.airlineDetails[0].Airline.AirlineName || data.airlineDetails[0].Airline.AirlineCode
      const templates=[String(userName),String(data.pnr),String(airLineName),String(depDate.toLocaleDateString('en-GB', options)),String(depTime.toLocaleTimeString('en-GB')),String(arrTime.toLocaleTimeString('en-GB')),String(data.totalAmount)];
      await whatsApi.sendWhtsAppOTPAISensy(phone,templates,"flightBooking");
      await sendSMSUtils.sendSMSForFlightBooking(data);

      // await commonFunction.FlightBookingConfirmationMail(airlineDetails);

      return res.status(statusCode.OK).send({statusCode: statusCode.OK, message: responseMessage.FLIGHT_BOOKED,result });
    }
    
  } catch (error) {
    return next(error);
  }
};

exports.getUserFlightBooking = async (req, res, next) => {
  try {
    const { page, limit, search, fromDate, toDate } = req.query;
    const isUserExist = await findUser({
      _id: req.userId,
      status: status.ACTIVE,
    });
    if (!isUserExist) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.USERS_NOT_FOUND,
      });
    }
    const queryData = {
      page,
      limit,
      search,
      fromDate,
      toDate,
      userId: isUserExist._id,
    };
    const result = await aggregatePaginateGetUserAmadeusFlightBooking1(
      queryData
    );
    if (result.docs.length == 0) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.DATA_NOT_FOUND,
      });
    }
    return res.status(statusCode.OK).send({
      statusCode: statusCode.OK,
      responseMessage: responseMessage.FLIGHT_BOOKED,
      result,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getFlightBookingId = async (req, res, next) => {
  try {
    const { flightBookingId } = req.query;
    const result = await getUserAmadeusFlightBooking({ _id: flightBookingId });
    if (!result) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.DATA_NOT_FOUND,
      });
    }
    return res.status(statusCode.OK).send({
      statusCode: statusCode.OK,
      responseMessage: responseMessage.FLIGHT_BOOKED,
      result,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getFlightBookingIdOfUser = async (req, res, next) => {
  try {
    const { flightBookingId } = req.query;
    const isUserExist = await findUser({
      _id: req.userId,
      status: status.ACTIVE,
    });
    if (!isUserExist) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.USERS_NOT_FOUND,
      });
    }
    const result = await getUserAmadeusFlightBooking({
      _id: flightBookingId,
      userId: isUserExist._id,
    });
    if (!result) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.DATA_NOT_FOUND,
      });
    }
    return res.status(statusCode.OK).send({
      statusCode: statusCode.OK,
      responseMessage: responseMessage.FLIGHT_BOOKED,
      result,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAllUserFlightBooking = async (req, res, next) => {
  try {
    const { page, limit, search, fromDate, toDate } = req.query;
    const queryData = { page, limit, search, fromDate, toDate };
    const result = await aggrPagGetUserAmadeusFlightBooking(queryData);
    if (result.docs.length == 0) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.DATA_NOT_FOUND,
      });
    }
    return res.status(statusCode.OK).send({
      statusCode: statusCode.OK,
      responseMessage: responseMessage.FLIGHT_BOOKED,
      result,
    });
  } catch (error) {
    return next(error);
  }
};

exports.UpdateTicket = async (req, res, next) => {
  try {
  const { bookingId, passengerDetails } = req.body;
    const isBookingExist = await findUserAmadeusFlightBooking({ _id: bookingId });
    
    if (!isBookingExist) {
      return res.status(statusCode.OK).send({
        statusCode: statusCode.NotFound,
        responseMessage: responseMessage.DATA_NOT_FOUND,
      });
    }
    const user = await findUser({ _id: isBookingExist.userId });
    let options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    var finalResult ;
    let depDate, depTime, arrTime, templates;

    for (const passenger of passengerDetails) {
      const result = await updateUserAmadeusFlightBooking(
        {
          _id: bookingId,
          "passengerDetails.firstName": passenger.firstName,
        },
        { $set: { "passengerDetails.$.TicketNumber": passenger.ticketNumber } }
      );
      if (result) {
        // finalResult.push(result);
        finalResult=result
        depDate = new Date(result.airlineDetails[0].Origin.DepTime);
        depTime = new Date(result.airlineDetails[0].Origin.DepTime);
        arrTime = new Date(result.airlineDetails[0].Origin.DepTime);
        arrTime.setHours(arrTime.getHours() - 2);

        templates = [
          String(passenger.firstName),
          String(result.pnr),
          String(result.airlineDetails[0].Airline.AirlineName),
          String(depDate.toLocaleDateString('en-GB', options)),
          String(depTime.toLocaleTimeString('en-GB')),
          String(arrTime.toLocaleTimeString('en-GB')),
          String(result.totalAmount)
        ];
      }
    }
    // Send WhatsApp messages and SMS
    // for (const result of finalResult) {
      const passengerContact = `+91${finalResult.passengerDetails[0].ContactNo}`;
      await whatsApi.sendWhtsAppOTPAISensy(passengerContact, templates, "flightBooking");
    // }

    const userTemplateName = [
      String(user.username),
      String(finalResult.pnr),
      String(finalResult.airlineDetails[0].Airline.AirlineName),
      String(depDate.toLocaleDateString('en-GB', options)),
      String(depTime.toLocaleTimeString('en-GB')),
      String(arrTime.toLocaleTimeString('en-GB')),
      String(finalResult.totalAmount)
    ];
    await whatsApi.sendWhtsAppOTPAISensy(`+91${user.phone.mobile_number}`, userTemplateName, "flightBooking");

    // Send SMS
    await sendSMSUtils.sendSMSForFlightBooking(finalResult[0]);

    // Send email confirmation
    await commonFunction.FlightBookingConfirmationMail1(finalResult);

    return res.status(statusCode.OK).send({
      statusCode: statusCode.OK,
      responseMessage: responseMessage.UPDATE_SUCCESS,
      result: finalResult,
    });
  } catch (error) {
    return next(error);
  }
};

exports.generatePdfOfUSer = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const data = await findUserAmadeusFlightBooking({ _id: bookingId });
    // sendSMS.
    const response = await commonFunction.FlightBookingConfirmationMail1(data);
    return res.status(statusCode.OK).send({
      statusCode: statusCode.OK,
      responseMessage: responseMessage.EMAIL_SENT,
      result: response,
    });
  } catch (error) {
    return next(error);
  }
};

