def format_amount(amount_str):
    try:
        amt = int(amount_str)
        if amt >= 10**18:
            return f"{amt / 10**18:,.2f}"
        return str(amt)
    except:
        return amount_str

def format_tx(tx):
    if not tx:
        return tx
    return {
        "tx_id": tx.get("tx_id", ""),
        "eth_address": tx.get("eth_address", ""),
        "cf_address": tx.get("cf_address", ""),
        "amount": tx.get("amount", "0"),
        "amount_formatted": format_amount(tx.get("amount", "0")),
        "fee": tx.get("fee", "0"),
        "fee_formatted": format_amount(tx.get("fee", "0")),
        "net_amount": tx.get("net_amount", "0"),
        "net_formatted": format_amount(tx.get("net_amount", "0")),
        "status": tx.get("status", 0),
        "status_text": ["Pending", "Confirming", "Completed", "Failed"][min(tx.get("status", 0), 3)],
        "direction": tx.get("direction", 0),
        "direction_text": "To Cellframe" if tx.get("direction", 0) == 0 else "To Ethereum",
        "eth_tx_hash": tx.get("eth_tx_hash", ""),
        "cf_tx_hash": tx.get("cf_tx_hash", ""),
        "block_number": tx.get("block_number"),
        "confirmations": tx.get("confirmations", 0),
        "created_at": str(tx.get("created_at", ""))[:19] if tx.get("created_at") else "",
        "completed_at": str(tx.get("completed_at", ""))[:19] if tx.get("completed_at") else ""
    }
