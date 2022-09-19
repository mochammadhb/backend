import argon2 from "argon2";
import { Users } from "../models/userModels.js";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const response = await Users.findAll();
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const response = await Users.findAll({
      where: {
        user_id: req.params.id,
      },
    });
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const editUsers = async (req, res) => {};

export const Register = async (req, res) => {
  const {
    fullname,
    username,
    email,
    phone_number,
    password,
    confirmPassword,
    checkbox,
  } = req.body;

  if (password !== confirmPassword)
    return res
      .status(403)
      .json({ message: "password or confirm password incorrect" });

  const hashPassword = await argon2.hash(password);

  if (checkbox !== true)
    return res
      .status(403)
      .json({ message: "please check first terms and conditions" });

  try {
    const response = await Users.create({
      fullname: fullname,
      username: username,
      email: email,
      phone_number: phone_number,
      password: hashPassword,
    });

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const Login = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        username: req.body.username,
      },
    });

    const match = await argon2.verify(user.password, req.body.password);

    if (!match)
      return res
        .status(403)
        .json({ message: "the password you entered is wrong." });

    const { user_id, username, email } = user;

    const accessToken = jwt.sign(
      { user_id, username, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );

    const refreshToken = jwt.sign(
      { user_id, username, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          user_id: user_id,
        },
      }
    );

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ accessToken });
  } catch (error) {
    return res.status(500).json({ message: "The email entered is wrong" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken || refreshToken === null) return res.sendStatus(204);

  const user = await Users.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!user) return res.sendStatus(204);

  await Users.update(
    { refresh_token: null },
    {
      where: {
        user_id: user.user_id,
      },
    }
  );

  res.clearCookie("refreshToken").sendStatus(200);
};

export const RefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken || refreshToken === null) return res.sendStatus(401);

  const user = await Users.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!user) return res.sendStatus(401);

  const { user_id, username, email } = user;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if (error) return res.sendStatus(403);
      const accessToken = jwt.sign(
        { user_id, username, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15s",
        }
      );
      res.json({ accessToken });
    }
  );
};
