;; Config updated 2026-05-29T13:06:21Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u8)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
