import express from 'express'
import * as accounts from './accountRoutes'
import * as transfers from './transferRoutes'

const router = express.Router()

router.post('/accounts/open/', accounts.openAccount)
router.delete('/accounts/close', accounts.closeAccount)
router.get('/accounts/account_status', accounts.getAccount)
router.put('/accounts/deposit', accounts.deposit)
router.put('/accounts/withdraw', accounts.withdraw)
router.post('/transfers/submit_transfer', transfers.handleTransfer)

export default router
