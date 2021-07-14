import fetch from 'node-fetch'

module.exports = async (req,res) => {
    console.log(req.body);
    if(req.body){
        var response = await fetch(req.body.url, req.body.opts).then(response => response.text());
        console.log(response);
        res.status(200).send(response)
    } else {
        res.status(500).error("Body missing");
    }
}
