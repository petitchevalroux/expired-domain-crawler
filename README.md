# expired-domain-crawler

## Starting indexer

### With only one url
node src/cli/crawl.js --urls http://example.com

### With multiple urls
node src/cli/crawl.js --urls http://example.com --urls http://example.com

## Monitoring

```
watch -d "echo "to download" && redis-cli llen exd:urls:todownload && echo "to filter" && redis-cli llen exd:urls:tofilter && echo "no dns" &&  redis-cli zcard exd:domain:lastNoMatchingDns && echo "available" && redis-cli zcard exd:domain:lastAvailable && echo "downloaded" && redis-cli zcard exd:url:lastDownloaded && echo "Next to download" && redis-cli lrange exd:urls:todownload 0 10"
```
