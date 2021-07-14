import fetch from 'node-fetch'

module.exports = async (req,res) => {
    if(req.body){
        var response = await fetch(req.body).then(response => response.json());
        res.status(200).send(response)
    } else {
        res.status(500).error("Body missing");
    }
}
