;; Config updated 2026-05-30T15:32:37Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u34)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
