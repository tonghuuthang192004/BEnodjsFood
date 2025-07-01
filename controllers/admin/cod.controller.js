const { url } = require('inspector');
const codmodel = require('../../modal/CodPaymet')
const axios = require('axios');
const crypto = require('crypto');
module.exports.payOrderCODController = async (req, res) => {
  const orderId = req.params.id; // lấy id từ params
  try {
    const result = await codmodel.payOrderCOD(orderId);
    res.json({ success: true, message: 'Thanh toán COD được ghi nhận', data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }

};
// module.exports.payOrderCODController = (req, res) => {
//  res.send("Trang Tổng Quan");
// }


module.exports.payMentMomo = async (req, res) => {
  var accessKey = 'F8BBA842ECF85'; // test, thay bằng của bạn
  var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // test, thay bằng của bạn
  var orderInfo = 'pay with MoMo';
  var partnerCode = 'MOMO';
  var redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
  var ipnUrl = 'https://e04b-171-239-246-14.ngrok-free.app/callback';
  var requestType = "payWithMethod";
  var amount = '50000';
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = '';
  var orderGroupId = '';
  var autoCapture = true;
  var lang = 'vi';

  var rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
  console.log("--------------------RAW SIGNATURE----------------")
  console.log(rawSignature)

  var signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
  
  console.log("--------------------SIGNATURE----------------")
  console.log(signature)

  const requestBody = {
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature
  };

  const option = {
    method: "POST",
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
    },
    data: requestBody
  };

  try {
    const result = await axios(option);
    // trả kết quả về client
    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Server error",
      error: error.message
    });
  }
};
