import mongoose from 'mongoose'
import { Account } from '../types/Account'
const { Schema } = mongoose

const schema = {
  balance: Number,
  ownerName: String,
}

// create a new schema
const account_schema = new Schema(schema)

export const account = mongoose.model('account', account_schema)

export const createAccount = (accountInfo: Account) => {
  return account.create({
    balance: accountInfo.balance || 0,
    ownerName: accountInfo.ownerName,
  })
}

export const closeAccount = (accountId: string) => {
  return account.deleteOne({ _id: accountId })
}

export const deposit = (accountId: string, creditAmount: number) => {
  return new Promise((resolve, reject) => {
    const acc = account.findOne({ _id: accountId }, (error, accountData) => {
      if (error) return Promise.reject(error)

      incrementBalance(acc, accountData, creditAmount)
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
  })
}

export const withdraw = (accountId, debitAmount) => {
  return new Promise((resolve, reject) => {
    const acc = account.findOne({ _id: accountId }, (err, accountData) => {
      if (accountData.balance - debitAmount < 0) {
        return Promise.reject(new Error('Insufficient funds'))
      }

      try {
        const data = incrementBalance(acc, accountData, -debitAmount)
        resolve(data)
      } catch (error) {
        console.log({ error })

        reject(error)
      }
    })
  })
}

const incrementBalance = (accountInstance, accountData, amount) => {
  return accountInstance
    .updateOne({
      $inc: { balance: amount },
    })
    .clone()
    .then(data =>
      Promise.resolve({
        balance: (accountData.balance += amount),
      })
    )
}
