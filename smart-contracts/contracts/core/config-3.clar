;; Config updated 2026-05-30T14:24:39Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u30)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
