;; token-poin.clar
;; Token Inflasi Tinggi untuk Aktivitas Harian (SIP-010 Standard)

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token token-poin)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))

;; Daftar kontrak yang boleh mencetak token (Faucet, dll)
(define-map approved-minters principal bool)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance token-poin who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply token-poin))
)

(define-read-only (get-name)
  (ok "Daily Poin")
)

(define-read-only (get-symbol)
  (ok "POIN")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-token-uri)
  (ok none)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err u101))
    (try! (ft-transfer? token-poin amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Fungsi Mint: Hanya bisa dipanggil oleh Admin atau Kontrak yang disetujui
(define-public (mint (amount uint) (recipient principal))
  (let
    (
      (is-approved (default-to false (map-get? approved-minters tx-sender)))
    )
    (asserts! (or (is-eq tx-sender contract-owner) is-approved) err-not-authorized)
    (ft-mint? token-poin amount recipient)
  )
)

;; Fungsi Burn: User bisa membakar tokennya sendiri (untuk Gacha/Staking)
(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (ft-burn? token-poin amount sender)
  )
)

;; Admin: Menambah kontrak lain (Faucet) agar bisa mint token
(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set approved-minters minter true))
  )
)
