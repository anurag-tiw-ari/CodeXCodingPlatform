
import express from "express";
import Razorpay from "razorpay";
import userMidddleware from "../middleware/userMiddleware.js";
import crypto from "crypto"
import User from "../models/user.js";

const paymentRouter=express.Router();

paymentRouter.post("/order",userMidddleware,async (req,res)=>{
    try {
    console.log("Key:", process.env.RAZORPAY_KEY)

    const userId=req.result._id;

    const prem = await User.findById(userId).select("premium")

   // console.log("prem",prem.)

    if(prem.premium)
        return res.status(400).send("Already Premium")

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    console.log("Hii")

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error:erroorrrr");
  }
})

paymentRouter.post("/order/validate", userMidddleware, async (req, res) => {
  //  console.log("VALIDATION HIT");
  //  console.log(req.body);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  console.log("digest:",digest)
  console.log("signature:",razorpay_signature)
  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  const userId = req.result._id

  await User.findByIdAndUpdate(userId,{premium:true, $inc: { coins: 2000 }},{ new: true })

  res.json({
    msg: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

export default paymentRouter;