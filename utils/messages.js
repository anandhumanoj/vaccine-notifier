
const getErrorJSON = () => {
  return {
    status: 500,
    message: "Internal Server Error"
  };
}

const getSuccessMessage = (data) => {
  var message = `<br/><br/>
<b>${data.name}</b>
<br/>
<br/>
Address  : ${data.address}
<br/>
Pin Code : ${data.pincode}
<br/>
Available: ${data.available}
<br/>
Min Age  : ${data.min_age_limit}
<br/>
<pre>=========================================
Date       | Dose 1 | Dose 2 | Vaccine
-----------------------------------------
${data.date} | ${data.available_dose1}     |  ${data.available_dose2}     | ${data.vaccine}
-----------------------------------------</pre>`
  return message;
}

const getShortSuccessMessage = (data) => {
  return `<br/>${data.name} - ${data.pincode} ( ${data.min_age_limit}+ )<br/>`+ 
  `${data.date} | D1 : ${data.available_dose1} | D2 : ${data.available_dose2} | ${data.vaccine}<br/><br/>`
}

const getNotAvailableMessage = (locations) => {
  return `<br/><br/>No slots available at monitored locations`;
}

const getErrorMessage = (error) => {
  return `<br/><br/>Error occured during execution.
<br/>Cause:<pre>${JSON.stringify(error)}</pre>`;
}

const getHeader = () => {
  return "<br/><br/>";
}

const getFooter = () => {
  return "<hr/>";
}

export {
  getSuccessMessage,
  getShortSuccessMessage,
  getNotAvailableMessage,
  getErrorJSON,
  getErrorMessage,
  getHeader,
  getFooter
}