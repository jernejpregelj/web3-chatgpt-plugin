import { ethers } from "ethers"

export const getDisplayBalance = (amount: string, decimal: string) => {
  try {
    return ethers.utils.formatUnits(amount, decimal).toString()
  } catch (e) {
    return ''
  }
}

export const fromDisplayBalance = (amount: string, decimal: string) => {
  try {
    return ethers.utils.parseUnits(amount, decimal).toString()
  } catch (e) {
    return ''
  }
}