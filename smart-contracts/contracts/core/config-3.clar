;; Config updated 2026-05-30T07:53:15Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u5)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
