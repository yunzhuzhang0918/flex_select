window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: true,
			autoplaySpeed: 5000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();

})
document.addEventListener('DOMContentLoaded', function() {
	// 配置参数
	const CONFIG = {
	  questions: ['question1', 'question2', 'question3'],
	  layers: ['layer0', 'layer4', 'layer8', 'layer12', 'layer16', 'layer20', 'layer24', 'layer27'],
	  referenceLayer: 'layer19',
	  basePath: 'static/interpolation',
	  originPath: 'static/interpolation/origin',
	  numFrames: 32,
	  currentQuestion: 'question1',
	  defaultFrames: {
		question1: 8,
		question2: 18,
		question3: 27
	  }
	};
  
	let layerCarousel = null;
  
	// 加载并显示图像
	function loadAndShowFrame(type, question, layer, frameNum, wrapperId) {
	  let path, label;
	  const paddedFrameNum = String(frameNum).padStart(6, '0');
	  
	  if (type === 'origin') {
		path = `${CONFIG.originPath}/${paddedFrameNum}.jpg`;
		label = 'Origin';
	  } else if (type === 'reference') {
		path = `${CONFIG.basePath}/${question}/${CONFIG.referenceLayer}/${paddedFrameNum}.jpg`;
		label = 'Reference Layer (Layer 19)';
	  } else {
		path = `${CONFIG.basePath}/${question}/${layer}/${paddedFrameNum}.jpg`;
		label = `Layer ${layer.replace('layer', '')}`;
	  }
  
	  const wrapper = document.getElementById(wrapperId);
	  if (!wrapper) return;
  
	  wrapper.innerHTML = `
		<div class="frame-label">${label}</div>
		<img src="${path}" class="frame-image" alt="${label} frame" 
			 onload="this.style.opacity=1" 
			 style="opacity:0;transition:opacity 0.3s"/>
	  `;
	}
  
	// 创建carousel内容
	function createCarouselContent(question) {
	  const fragment = document.createDocumentFragment();
	  const defaultFrame = CONFIG.defaultFrames[question]; // 获取当前问题的默认帧 
	  CONFIG.layers.forEach(layer => {
		const item = document.createElement('div');
		item.className = 'item';
		
		item.innerHTML = `
		  <div class="columns is-vcentered interpolation-panel">
			<div class="column is-3 has-text-centered frame-column">
			  <div class="frame-wrapper" id="origin-${question}-${layer}"></div>
			</div>
			<div class="column frame-column">
			  <div class="frame-wrapper" id="current-${question}-${layer}"></div>
			  <input class="slider is-fullwidth is-large is-info interpolation-slider"
					 data-question="${question}"
					 data-layer="${layer}"
					 step="1" min="0" max="${CONFIG.numFrames - 1}" 
					 value="0" type="range">
			  <div class="has-text-centered frame-counter">
				Frames: <span class="current-frame-num">0</span> / ${CONFIG.numFrames - 1}
			  </div>
			</div>
			<div class="column is-3 has-text-centered frame-column">
			  <div class="frame-wrapper" id="reference-${question}-${layer}"></div>
			</div>
		  </div>
		`;
		
		fragment.appendChild(item);
		
		// 设置初始图像
		loadAndShowFrame('origin', question, layer, defaultFrame, `origin-${question}-${layer}`);
		loadAndShowFrame('current', question, layer, defaultFrame, `current-${question}-${layer}`);
		loadAndShowFrame('reference', question, layer, defaultFrame, `reference-${question}-${layer}`);
		
		// 添加slider事件
		const slider = item.querySelector('.interpolation-slider');
		slider.addEventListener('input', function() {
		  const frameNum = parseInt(this.value);
		  const layer = this.getAttribute('data-layer');
		  const frameNumDisplay = this.parentElement.querySelector('.current-frame-num');
		  
		  loadAndShowFrame('origin', question, layer, frameNum, `origin-${question}-${layer}`);
		  loadAndShowFrame('current', question, layer, frameNum, `current-${question}-${layer}`);
		  loadAndShowFrame('reference', question, layer, frameNum, `reference-${question}-${layer}`);
		  
		  frameNumDisplay.textContent = frameNum;
		});
	  });
	  
	  return fragment;
	}
  
	function initCarousel(question) {
		const carousel = document.getElementById('layer-carousel');
		const defaultFrame = CONFIG.defaultFrames[question]; // 获取当前问题的默认帧 	
		// 显示加载状态
		carousel.innerHTML = '<div class="has-text-centered py-5">Loading...</div>';
		
		// 创建新的 carousel 容器
		const newCarousel = document.createElement('div');
		newCarousel.id = 'layer-carousel';
		newCarousel.className = 'carousel layer-carousel';
		newCarousel.style.opacity = '0'; // 初始透明
		
		// 添加新内容
		newCarousel.appendChild(createCarouselContent(question));
		
		// 替换 DOM
		carousel.parentNode.replaceChild(newCarousel, carousel);
		
		
		// 销毁旧的 carousel 实例
		if (layerCarousel) {
		  try {
			layerCarousel.destroy();
		  } catch (e) {
			console.error('Error destroying carousel:', e);
		  }
		}
		
		// 使用 setTimeout 确保 DOM 更新完成
		setTimeout(() => {
		  try {
			layerCarousel = bulmaCarousel.attach('#layer-carousel', {
			  slidesToScroll: 1,
			  slidesToShow: 1,
			  loop: false,
			  infinite: false,
			  pagination: false
			});
			
			// 显示内容
			newCarousel.style.opacity = '1';
			newCarousel.style.transition = 'opacity 0.3s ease';
			
			// 强制刷新 carousel
			if (layerCarousel && layerCarousel._carousel) {
			  setTimeout(() => {
				layerCarousel._carousel.onResize();
			  }, 200);
			}
		  } catch (e) {
			console.error('Error initializing carousel:', e);
			newCarousel.style.opacity = '1'; // 即使出错也显示内容
		  }
		}, 50);
		CONFIG.layers.forEach(layer => {
			const slider = document.querySelector(`.interpolation-slider[data-question="${question}"][data-layer="${layer}"]`);
			if (slider) {
			slider.value = defaultFrame;
			// 同时更新显示的帧数文本
			const frameNumDisplay = slider.parentElement.querySelector('.current-frame-num');
			if (frameNumDisplay) frameNumDisplay.textContent = defaultFrame;
			}
  		});
		CONFIG.layers.forEach(layer => {
			const slider = document.querySelector(`.interpolation-slider[data-layer="${layer}"]`);
			if (slider) {
				const frameNum = parseInt(slider.value);
				loadAndShowFrame('origin', question, layer, defaultFrame, `origin-${question}-${layer}`);
				loadAndShowFrame('current', question, layer, defaultFrame, `current-${question}-${layer}`);
				loadAndShowFrame('reference', question, layer, defaultFrame, `reference-${question}-${layer}`);
			}
		});
		
	  }
	  // 问题选择按钮事件
document.querySelectorAll('.question-btn').forEach(btn => {
	btn.addEventListener('click', function() {
	  const question = this.getAttribute('data-question');
	  if (CONFIG.currentQuestion === question) return;
	  
	  // 禁用所有按钮
	  document.querySelectorAll('.question-btn').forEach(b => {
		b.disabled = true;
	  });
	  
	  CONFIG.currentQuestion = question;
	  
	  // 更新按钮状态
	  document.querySelectorAll('.question-btn').forEach(b => {
		b.classList.remove('is-info');
		b.classList.add('is-light');
	  });
	  this.classList.remove('is-light');
	  this.classList.add('is-info');
	  
	  // 重新初始化carousel
	  initCarousel(question);
	  
	  // 重新启用按钮
	  setTimeout(() => {
		document.querySelectorAll('.question-btn').forEach(b => {
		  b.disabled = false;
		});
	  }, 500);
	});
  });
  
	// 初始加载
	function initialize() {
	  // 预加载第一帧图像
	  
	  CONFIG.layers.forEach(layer => {
		new Image().src = `${CONFIG.originPath}/000000.jpg`;
		new Image().src = `${CONFIG.basePath}/${CONFIG.currentQuestion}/${layer}/000000.jpg`;
		new Image().src = `${CONFIG.basePath}/${CONFIG.currentQuestion}/${CONFIG.referenceLayer}/000000.jpg`;
	  });
	  
	  // 初始化carousel
	  setTimeout(() => {
		initCarousel(CONFIG.currentQuestion);
	  }, 50);
	}
	
	// 确保DOM完全加载
	if (document.readyState === 'complete') {
	  initialize();
	} else {
	  window.addEventListener('load', initialize);
	}
  });

  