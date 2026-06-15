;; Config updated 2026-06-15T00:52:49Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u80)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
